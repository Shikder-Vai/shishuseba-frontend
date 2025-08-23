import axios from "axios";

const axiosPublic = axios.create({
  // baseURL: "https://shishu-seba.onrender.com/v1",
  //   baseURL: "http://localhost:5000/v1",
  baseURL: "http://31.97.233.143:5000/v1",
  // baseURL: "https://api.shishuseba.com/v1",
});
const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
