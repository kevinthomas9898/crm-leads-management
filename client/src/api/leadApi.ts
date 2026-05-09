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
