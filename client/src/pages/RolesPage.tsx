import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { fetchRoles, createRole, updateRole, deleteRole } from "../api/roleApi";
import DataTable from "../components/DataTable";
import Dialog from "../components/Dialog";
import TextInput from "../components/TextInput";
import Pagination from "../components/Pagination";
import type { Role, CreateRoleData, UpdateRoleData } from "../types/role";

function RolesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const createForm = useForm<CreateRoleData>({
    defaultValues: {
      name: "",
      permissions: [],
      description: "",
    },
  });

  const editForm = useForm<UpdateRoleData>({
    defaultValues: {
      name: "",
      permissions: [],
      description: "",
    },
  });

  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () => fetchRoles({ page, limit: 10, search: debouncedSearch, sortBy, sortOrder }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsCreateModalOpen(false);
      createForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsEditModalOpen(false);
      setSelectedRole(null);
      editForm.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    },
  });

  const handleCreate = (data: CreateRoleData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    editForm.reset({
      name: role.name,
      permissions: role.permissions,
      description: role.description,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = (data: UpdateRoleData) => {
    if (selectedRole) {
      updateMutation.mutate({
        id: selectedRole._id,
        data,
      });
    }
  };

  const handleDelete = (roleId: string) => {
    const role = data?.roles.find((r: Role) => r._id === roleId);
    if (role) {
      setSelectedRole(role);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedRole) {
      deleteMutation.mutate(selectedRole._id);
    }
  };

  const columns = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }: { row: { original: Role } }) => (
        <span className="text-gray-900 dark:text-gray-100">{row.original.name}</span>
      ),
    },
    {
      id: "permissions",
      header: "Permissions",
      cell: ({ row }: { row: { original: Role } }) => (
        <div className="flex gap-1 flex-wrap">
          {row.original.permissions.length > 0 ? (
            row.original.permissions.map((perm: string) => (
              <span
                key={perm}
                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {perm}
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">No permissions</span>
          )}
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: ({ row }: { row: { original: Role } }) => (
        <span className="text-gray-600 dark:text-gray-300">{row.original.description || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Role } }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.original._id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg font-medium text-gray-600">Loading roles...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-600">Error loading roles</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Add Role
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Search</label>
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.roles || []}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
      />

      <Pagination
        currentPage={data?.pagination?.currentPage || 1}
        totalPages={data?.pagination?.totalPages || 1}
        total={data?.pagination?.total || 0}
        limit={data?.pagination?.limit || 10}
        onPageChange={setPage}
        debounceMs={300}
      />

      {/* Create Role Modal */}
      <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Role">
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <TextInput
            name="name"
            control={createForm.control}
            label="Name *"
            type="text"
            placeholder="Enter role name"
          />
          <TextInput
            name="description"
            control={createForm.control}
            label="Description"
            type="text"
            placeholder="Enter role description"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {["create_lead", "read_lead", "update_lead", "delete_lead", "manage_users", "manage_roles"].map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={perm}
                    onChange={(e) => {
                      const currentPerms = createForm.getValues("permissions") || [];
                      if (e.target.checked) {
                        createForm.setValue("permissions", [...currentPerms, perm]);
                      } else {
                        createForm.setValue("permissions", currentPerms.filter((p) => p !== perm));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Role">
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <TextInput
            name="name"
            control={editForm.control}
            label="Name *"
            type="text"
            placeholder="Enter role name"
          />
          <TextInput
            name="description"
            control={editForm.control}
            label="Description"
            type="text"
            placeholder="Enter role description"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {["create_lead", "read_lead", "update_lead", "delete_lead", "manage_users", "manage_roles"].map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={perm}
                    defaultChecked={selectedRole?.permissions.includes(perm)}
                    onChange={(e) => {
                      const currentPerms = editForm.getValues("permissions") || [];
                      if (e.target.checked) {
                        editForm.setValue("permissions", [...currentPerms, perm]);
                      } else {
                        editForm.setValue("permissions", currentPerms.filter((p) => p !== perm));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Role">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default RolesPage;
