import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api/userApi";
import DataTable from "../components/DataTable";
import Dialog from "../components/Dialog";
import TextInput from "../components/TextInput";
import Select from "../components/Select";
import Pagination from "../components/Pagination";
import type { User, CreateUserData, UpdateUserData } from "../types/user";

function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const createForm = useForm<CreateUserData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const editForm = useForm<UpdateUserData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
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
    queryKey: ["users", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () => fetchUsers({ page, limit: 10, search: debouncedSearch, sortBy, sortOrder }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateModalOpen(false);
      createForm.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      editForm.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    },
  });

  const handleCreate = (data: CreateUserData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    const roleName = user.role && typeof user.role === 'object' ? user.role.name : (user.role as string);
    editForm.reset({
      name: user.name,
      email: user.email,
      password: "",
      role: (roleName || "user") as string,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = (data: UpdateUserData) => {
    if (selectedUser) {
      updateMutation.mutate({
        id: selectedUser._id,
        data,
      });
    }
  };

  const handleDelete = (userId: string) => {
    const user = data?.users.find((u: User) => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser._id);
    }
  };

  const columns = [
    {
      id: "name",
      header: "Name",
      cell: ({ row }: { row: { original: User } }) => (
        <span className="text-gray-900 dark:text-gray-100">{row.original.name}</span>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }: { row: { original: User } }) => (
        <span className="text-gray-600 dark:text-gray-300">{row.original.email}</span>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }: { row: { original: User } }) => {
        const roleName: string = row.original.role && typeof row.original.role === 'object' 
          ? row.original.role.name 
          : (row.original.role as string || "No Role");
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              roleName === "admin"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {roleName}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: User } }) => (
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
        <p className="text-lg font-medium text-gray-600">Loading users...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-600">Error loading users</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and roles</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.users || []}
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

      {/* Create User Modal */}
      <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New User">
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <TextInput
            name="name"
            control={createForm.control}
            label="Name *"
            type="text"
            placeholder="Enter user name"
          />
          <TextInput
            name="email"
            control={createForm.control}
            label="Email *"
            type="email"
            placeholder="Enter email address"
          />
          <TextInput
            name="password"
            control={createForm.control}
            label="Password *"
            type="password"
            placeholder="Enter password"
          />
          <Select
            name="role"
            control={createForm.control}
            label="Role"
            options={[
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ]}
          />
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
              {createMutation.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <TextInput
            name="name"
            control={editForm.control}
            label="Name *"
            type="text"
            placeholder="Enter user name"
          />
          <TextInput
            name="email"
            control={editForm.control}
            label="Email *"
            type="email"
            placeholder="Enter email address"
          />
          <TextInput
            name="password"
            control={editForm.control}
            label="Password (leave blank to keep current)"
            type="password"
            placeholder="Enter new password"
          />
          <Select
            name="role"
            control={editForm.control}
            label="Role"
            options={[
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ]}
          />
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
              {updateMutation.isPending ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
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

export default UsersPage;
