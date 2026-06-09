import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, createLead, updateLead, deleteLead } from "../api/leadApi";
import { columns } from "../table/columns";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import LeadModal from "../components/LeadModal";
import { useMemo } from "react";
import type { Lead } from "../types/lead";
import { PERMISSIONS } from "../constants/permissions";
import { hasPermission } from "../utils/auth";

interface LeadsPageProps {
    selectedLead: Lead | null;
}

function LeadsPage({ selectedLead }: LeadsPageProps) {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const canCreateLead = hasPermission(PERMISSIONS.CREATE_LEAD, user);
    const canUpdateLead = hasPermission(PERMISSIONS.UPDATE_LEAD, user);
    const canDeleteLead = hasPermission(PERMISSIONS.DELETE_LEAD, user);

    const [page, setPage] = useState(1);

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [status, setStatus] = useState("");
    const [owner, setOwner] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [deleteConfirmLead, setDeleteConfirmLead] = useState<Lead | null>(null);

    const queryClient = useQueryClient();

    const memoizedColumns = useMemo(() => columns({
        onEdit: (lead) => {
            setEditingLead(lead);
            setIsModalOpen(true);
        },
        onDelete: (lead) => {
            setDeleteConfirmLead(lead);
        },
        canUpdateLead,
        canDeleteLead
    }), [canUpdateLead, canDeleteLead]);

    const limit = 10;

    // Debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        status,
        owner,
        sortBy,
        sortOrder,
    ]);

    // Handle lead selection from global search
    useEffect(() => {
        if (selectedLead) {
            setSearch(selectedLead.name);
        }
    }, [selectedLead]);

    const { data, isLoading, error } = useQuery({
        queryKey: [
            "leads",
            page,
            debouncedSearch,
            sortBy,
            sortOrder,
            status,
            owner,
        ],

        queryFn: () =>
            fetchLeads({
                page,
                limit,
                search: debouncedSearch,
                sortBy,
                sortOrder,
                status,
                owner,
            }),

        placeholderData: (previousData) => previousData,
    });

    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            setIsModalOpen(false);
            setEditingLead(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateLead(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            setIsModalOpen(false);
            setEditingLead(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            setDeleteConfirmLead(null);
        },
    });

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-600">Loading leads...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
            </div>
        );
    }

    if (error) {
        return <h2>Error loading leads</h2>;
    }

    const handleModalSubmit = (data: any) => {
        if (editingLead) {
            updateMutation.mutate({ id: editingLead._id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleAddLead = () => {
        setEditingLead(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingLead(null);
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmLead) {
            deleteMutation.mutate(deleteConfirmLead._id);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmLead(null);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Management</h2>
                    <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Manage and track your leads efficiently</p>
                </div>
                {canCreateLead && (
                    <button
                        onClick={handleAddLead}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Lead
                    </button>
                )}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="lg:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                        </select>
                    </div>

                    {/* Owner Filter */}
                    <div className="lg:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Owner</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                        >
                            <option value="">All Owners</option>
                            <option value="Kevin">Kevin</option>
                            <option value="John">John</option>
                            <option value="Sarah">Sarah</option>
                            <option value="Mike">Mike</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <DataTable
                    columns={memoizedColumns}
                    data={data.data}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    setSortBy={setSortBy}
                    setSortOrder={setSortOrder}
                />
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                total={data.total}
                limit={limit}
                onPageChange={setPage}
                debounceMs={300}
            />

            {/* Lead Modal */}
            <LeadModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                lead={editingLead}
                onSubmit={handleModalSubmit}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmLead && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 dark:bg-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6 dark:text-gray-300">
                            Are you sure you want to delete the lead "{deleteConfirmLead.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadsPage;