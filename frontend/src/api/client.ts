import axios from "axios";
import { AxiosHeaders } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

const setTokenGetter = (getter: TokenGetter | null) => {
  tokenGetter = getter;
};

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (!tokenGetter) {
    return config;
  }

  const token = await tokenGetter();
  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

export { apiClient, setTokenGetter };
