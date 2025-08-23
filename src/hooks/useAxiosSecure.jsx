// useAxiosSecure.js hook

import axios from 'axios';
import { useAuth } from '../main';

const useAxiosSecure = () => {
  const { user } = useAuth();
  
  const axiosSecure = axios.create({
    baseURL: "http://localhost:5000/v1",
  });

  // Check gmail before each request
  axiosSecure.interceptors.request.use((config) => {
    if (!user?.email?.endsWith('@gmail.com')) {
      throw new Error('Gmail required');
    }
    return config;
  });

  return axiosSecure;
};

export default useAxiosSecure;