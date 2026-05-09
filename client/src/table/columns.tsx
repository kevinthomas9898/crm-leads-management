import type { ColumnDef } from "@tanstack/react-table";

import type { Lead } from "../types/lead";

export const columns: ColumnDef<Lead>[] = [
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