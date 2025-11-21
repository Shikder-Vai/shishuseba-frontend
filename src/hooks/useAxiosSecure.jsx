import axios from "axios";
import { useAuth } from "../main";

const useAxiosSecure = () => {
  const { user } = useAuth();

  const axiosSecure = axios.create({
    baseURL: "http://localhost:5000/v1",
    // baseURL: "https://api.shishuseba.com/v1",
  });

  axiosSecure.interceptors.request.use(
    (config) => {
      if (user?._id) {
        config.headers["user-id"] = user._id;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosSecure;
};

export default useAxiosSecure;
