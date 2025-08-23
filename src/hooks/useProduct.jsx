import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useProduct = (productId) => {
  const axiosPublic = useAxiosPublic();

  const {
    data: product,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await axiosPublic.get(`/products/single/${productId}`);
      return response.data?.data;
    },
    enabled: !!productId, // Only fetch if productId is truthy
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // optional: prevent refetch on tab switch
  });

  return {
    product,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  };
};

export default useProduct;
