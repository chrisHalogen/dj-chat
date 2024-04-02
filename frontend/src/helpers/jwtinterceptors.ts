import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { useAuthService } from "../services/AuthServices";

const API_BASE_URL = BASE_URL;

const useAxiosWithInterceptor = (): AxiosInstance => {
  const jwtAxios = axios.create({ baseURL: API_BASE_URL });
  const navigate = useNavigate();
  const { logout } = useAuthService();

  jwtAxios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 || error.response?.status === 403) {
        // const goRoot = () => navigate("/");
        // goRoot();
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const refresh_response = await axios.post(
              "http://127.0.0.1:8000/api/token/refresh/",
              { refresh: refreshToken }
            );
            if (refresh_response["status"] == 200) {
              const newAccessToken = refresh_response.data.access;
              localStorage.setItem("access_token", newAccessToken);
              originalRequest.headers[
                "Authorization"
              ] = `Bearer ${newAccessToken}`;
              return jwtAxios(originalRequest);
            }
          } catch (error) {
            logout();
            navigate("/login");
            return Promise.reject(error);
          }
        } else {
          navigate("/login");
        }
      }
      return Promise.reject(error);
    }
  );
  return jwtAxios;
};

export default useAxiosWithInterceptor;
