import { useState } from "react";
import { AuthServiceProps } from "../@types/auth-service";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

// import { Preflight_Headers } from "../helpers/preflightMethods";
// import Cookies from "js-cookie";

export function useAuthService(): AuthServiceProps {
  const navigate = useNavigate();

  const getInitialLoggedInValue = () => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    return loggedIn !== null && loggedIn === "true";
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    getInitialLoggedInValue
  );

  const getUserIdFromToken = (token: string) => {
    const tokenParts = token.split(".");
    const encodedPayload = tokenParts[1];
    const decodedPayload = atob(encodedPayload);
    const payloadData = JSON.parse(decodedPayload);
    console.log(payloadData);
    const userId = payloadData.user_id;
    return userId;
  };

  const getUserDetails = async (id: Number, token: string) => {
    // const url = "http://localhost:8000/api/token/";
    try {
      // const userId = localStorage.getItem("userId");
      // const access = localStorage.getItem("access_token");
      const url = `http://localhost:8000/api/account/?user_id=${userId}`;
      //   console.log("access = ", access);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem("username", response.data.username);
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      console.log(response);
    } catch (error: any) {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      return error;
    }
  };

  const register = async (username: string, password: string) => {
    const url = "http://localhost:8000/api/register/";
    try {
      const response = await axios.post(url, { username, password });

      return response.status;
    } catch (error: any) {
      return error.response.status;
    }
  };

  const login = async (username: string, password: string) => {
    const url = "http://localhost:8000/api/token/";
    try {
      const response = await axios.post(url, { username, password });

      const { access, refresh } = response.data;
      // console.log("access = ", access);
      // console.log("refresh = ", refresh);
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("userId", getUserIdFromToken(access));
      localStorage.setItem("isLoggedIn", "true");

      setIsLoggedIn(true);

      // getUserDetails(getUserIdFromToken(access), access);
      return 1;
    } catch (error: any) {
      return error.response.status;
    }
  };

  const refreshAccessToken = async () => {
    try {
      console.log("refreshing token");
      const response = await axios.post(`${BASE_URL}/token/refresh/`, {
        refresh: localStorage.getItem("refresh_token"),
      });

      if (response.status === 200) {
        localStorage.setItem("access_token", response.data.access);
        Promise.resolve(200);
      } else {
        return Promise.reject("error");
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    navigate("/login");
    return;
  };

  return { login, isLoggedIn, logout, refreshAccessToken, register };
}
