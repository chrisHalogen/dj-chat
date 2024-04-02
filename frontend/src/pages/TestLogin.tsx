import { useEffect, useState } from "react";
import { useAuthServiceContext } from "../context/AuthContext";
import axios from "axios";
import useAxiosWithInterceptor from "../helpers/jwtinterceptors";

const TestLogin = () => {
  const { isLoggedIn, logout } = useAuthServiceContext();
  const [username, setUsername] = useState<string>("");
  const jwtAxios = useAxiosWithInterceptor();

  const getUserDetails = async () => {
    // const url = "http://localhost:8000/api/token/";
    try {
      const userId = localStorage.getItem("userId");
      // const access = localStorage.getItem("access_token");
      const url = `http://localhost:8000/api/account/?user_id=${userId}`;
      // console.log("access inside login = ", access);
      const response = await jwtAxios.get(url);

      // const response = await jwtAxios.get(url, {
      //   headers: {
      //     Authorization: `Bearer ${access}`,
      //   },
      // });
      // const userDetails = response.data;
      setUsername(response.data.username);
      console.log(response.data);
    } catch (error: any) {
      return error;
    }
  };

  // useEffect(() => {
  //   getUserDetails();
  // }, []);

  return (
    <>
      <div>{isLoggedIn.toString()}</div>
      <div>
        <button onClick={logout}>Logout</button>
        <br />
        <button onClick={getUserDetails}>Get user details</button>
      </div>
      <div>Username: {username}</div>
    </>
  );
};

export default TestLogin;
