import api from "./axios";

export const fetchLeads = async (params: any) => {
  const response = await api.get("/leads", {
    params,
  });

  return response.data;
};

export const globalSearch = async (query: string) => {
  const response = await api.get(`/search/global?query=${query}`);

  return response.data;
};
