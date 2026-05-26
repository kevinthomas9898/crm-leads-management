import api from "./axios";

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
  const response = await api.post("/leads", leadData);
  return response.data;
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
  const response = await api.put(`/leads/${id}`, leadData);
  return response.data;
};

export const deleteLead = async (id: string) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};
