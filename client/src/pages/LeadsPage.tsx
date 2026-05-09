import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeads } from "../api/leadApi";
import { columns } from "../table/columns";
import DataTable from "../components/DataTable";
import { useMemo } from "react";

function LeadsPage() {
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
        return <h2>Loading leads...</h2>;
    }

    if (error) {
        return <h2>Error loading leads</h2>;
    }

    return (
        <div className="space-y-2">
            <h2>Leads Management</h2>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md bg-white"
            />

            <div className="flex gap-4 mb-4" >
                {/* Status Filter */}
                <select
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                >
                    <option value="">
                        All Status
                    </option>

                    <option value="New">
                        New
                    </option>

                    <option value="Contacted">
                        Contacted
                    </option>

                    <option value="Qualified">
                        Qualified
                    </option>

                    <option value="Lost">
                        Lost
                    </option>
                </select>

                {/* Owner Filter */}
                <select
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    value={owner}
                    onChange={(e) =>
                        setOwner(e.target.value)
                    }
                >
                    <option value="">
                        All Owners
                    </option>

                    <option value="Kevin">
                        Kevin
                    </option>

                    <option value="John">
                        John
                    </option>

                    <option value="Sarah">
                        Sarah
                    </option>

                    <option value="Mike">
                        Mike
                    </option>
                </select>
            </div>

            <DataTable
                columns={memoizedColumns}
                data={data.data}
                sortBy={sortBy}
                sortOrder={sortOrder}
                setSortBy={setSortBy}
                setSortOrder={setSortOrder}
            />

            {/* Pagination */}
            <div className="flex items-center gap-4 mt-6" >
                <button
                    onClick={() =>
                        setPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Previous
                </button>

                <span className="px-4 py-2 text-gray-700 font-medium">
                    Page {page} of {data.totalPages}
                </span>

                <button
                    onClick={() =>
                        setPage((prev) =>
                            prev < data.totalPages
                                ? prev + 1
                                : prev
                        )
                    }
                    disabled={page === data.totalPages}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default LeadsPage;