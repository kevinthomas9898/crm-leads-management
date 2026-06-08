import type { ColumnDef } from "@tanstack/react-table";

import type { Lead } from "../types/lead";

interface ColumnsProps {
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  isAdmin: boolean;
}

export const columns = ({ onEdit, onDelete, isAdmin }: ColumnsProps): ColumnDef<Lead>[] => {
  const baseColumns: ColumnDef<Lead>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
    },

    {
      id: "email",
      accessorKey: "email",
      header: "Email",
    },

    {
      id: "company",
      accessorKey: "company",
      header: "Company",
    },

    {
      id: "status",
      accessorKey: "status",
      header: "Status",
    },

    {
      id: "owner",
      accessorKey: "owner",
      header: "Owner",
    },

    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Created Date",

      cell: ({ row }) => {
        return new Date(
          row.original.createdAt
        ).toLocaleDateString();
      },
    },
  ];

  if (isAdmin) {
    baseColumns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(row.original)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Delete
            </button>
          </div>
        );
      },
    });
  }

  return baseColumns;
};