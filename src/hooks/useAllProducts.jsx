import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useAllProducts = () => {
  const axiosPublic = useAxiosPublic();
  const {
    data: products = [],
    isLoading: loadingProduct,
    refetch,
  } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res?.data;
    },
  });
  return [products?.products || [], loadingProduct, refetch];
};

export default useAllProducts;
