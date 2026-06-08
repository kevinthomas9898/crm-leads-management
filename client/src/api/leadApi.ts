import api from "./axios";
import { toast } from "react-toastify";

interface FetchLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  owner?: string;
}

export const fetchLeads = async (params: FetchLeadsParams) => {
  const response = await api.get("/leads", { params });
  return response.data;
};

export const globalSearch = async (query: string) => {
  const response = await api.get(`/search/global?query=${query}`);
  return response.data;
};

export const createLead = async (leadData: {
  name: string;
  email: string;
  company: string;
  status?: string;
  owner: string;
}) => {
  try {
    const response = await api.post("/leads", leadData);
    toast.success("Lead created successfully!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateLead = async (
  id: string,
  leadData: {
    name?: string;
    email?: string;
    company?: string;
    status?: string;
    owner?: string;
  }
) => {
  try {
    const response = await api.put(`/leads/${id}`, leadData);
    toast.success("Lead updated successfully!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteLead = async (id: string) => {
  try {
    const response = await api.delete(`/leads/${id}`);
    toast.success("Lead deleted successfully!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
