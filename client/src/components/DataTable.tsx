import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import type { ColumnDef } from "@tanstack/react-table";

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];

    sortBy: string;
    sortOrder: string;

    setSortBy: React.Dispatch<
        React.SetStateAction<string>
    >;

    setSortOrder: React.Dispatch<
        React.SetStateAction<string>
    >;
}``

function DataTable<T>({
    columns,
    data,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
}: DataTableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 dark:from-gray-700 dark:to-gray-800 dark:border-gray-600">
                    {table
                        .getHeaderGroups()
                        .map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(
                                    (header) => (
                                        <th
                                            key={header.id}
                                            onClick={() => {
                                                const column = header.column.id;

                                                if (column === "actions") return;

                                                if (
                                                    sortBy === column
                                                ) {
                                                    setSortOrder(
                                                        (prev) =>
                                                            prev === "asc"
                                                                ? "desc"
                                                                : "asc"
                                                    );
                                                } else {
                                                    setSortBy(column);
                                                    setSortOrder("asc");
                                                }
                                            }}
                                            className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 transition-colors duration-200 first:rounded-tl-xl last:rounded-tr-xl dark:text-gray-200 ${
                                                header.column.id === "actions"
                                                    ? ""
                                                    : "cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-600"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {sortBy === header.column.id && (
                                                    <span className="text-blue-600 dark:text-blue-400">
                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    )
                                )}
                            </tr>
                        ))}
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {table
                        .getRowModel()
                        .rows.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-blue-50 transition-colors duration-200 dark:hover:bg-gray-700"
                            >
                                {row
                                    .getVisibleCells()
                                    .map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;