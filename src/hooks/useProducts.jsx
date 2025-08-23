import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useProduct = () => {
  const axiosOublic = useAxiosPublic();
  const {
    data: products = [],
    isLoading: loadingProduct,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async() => {
        const res = await axiosOublic.get('/products')
        return res?.data;
    }
  });
  return [products, loadingProduct, refetch]
};

export default useProduct;
