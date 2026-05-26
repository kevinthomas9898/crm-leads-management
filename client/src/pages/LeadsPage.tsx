import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api/leadApi";
import { columns } from "../table/columns";
import DataTable from "../components/DataTable";
import Pagination from "../components/Pagination";
import { useMemo } from "react";
import type { Lead } from "../types/lead";

interface LeadsPageProps {
    selectedLead: Lead | null;
}

function LeadsPage({ selectedLead }: LeadsPageProps) {
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [status, setStatus] = useState("");
    const [owner, setOwner] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const memoizedColumns = useMemo(() => columns, []);

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

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Leads Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and track your leads efficiently</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="lg:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
        </div>
    );
}

export default LeadsPage;