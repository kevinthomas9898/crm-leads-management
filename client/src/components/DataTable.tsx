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
        <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                    {table
                        .getHeaderGroups()
                        .map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(
                                    (header) => (
                                        <th
                                            key={header.id}
                                            onClick={() => {
                                                const column =
                                                    header.column.id;

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

                                                    setSortOrder(
                                                        "asc"
                                                    );
                                                }
                                            }}
                                            className="px-4 py-3 text-left cursor-pointer select-none"
                                        >
                                            {flexRender(
                                                header.column
                                                    .columnDef.header,
                                                header.getContext()
                                            )}

                                            {sortBy ===
                                                header.column.id &&
                                                (sortOrder ===
                                                    "asc"
                                                    ? " ↑"
                                                    : " ↓")}
                                        </th>
                                    )
                                )}
                            </tr>
                        ))}
                </thead>

                <tbody>
                    {table
                        .getRowModel()
                        .rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-t hover:bg-gray-50"
                            >
                                {row
                                    .getVisibleCells()
                                    .map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-3"
                                        >
                                            {flexRender(
                                                cell.column
                                                    .columnDef.cell,
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