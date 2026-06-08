import api from "./axios";
import { toast } from "react-toastify";

export const fetchRoles = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const response = await api.get("/roles", { params });
  return response.data;
};

export const fetchRoleById = async (id: string) => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (roleData: {
  name: string;
  permissions?: string[];
  description?: string;
}) => {
  try {
    const response = await api.post("/roles", roleData);
    toast.success("Role created successfully!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateRole = async (
  id: string,
  roleData: {
    name?: string;
    permissions?: string[];
    description?: string;
  }
) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    toast.success("Role updated successfully!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteRole = async (id: string) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    toast.success("Role deleted successfully!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
