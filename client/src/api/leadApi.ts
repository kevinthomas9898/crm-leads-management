import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const fetchLeads = async (params: any) => {
  const response = await API.get("/leads", {
    params,
  });

  return response.data;
};

export const globalSearch = async (query: string) => {
  const response = await API.get(`/search/global?query=${query}`);

  return response.data;
};
