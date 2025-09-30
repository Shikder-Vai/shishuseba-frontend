import { useInfiniteQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useProduct = () => {
  const axiosOublic = useAxiosPublic();

  const fetchProducts = async ({ pageParam = 1 }) => {
    const res = await axiosOublic.get(`/products?page=${pageParam}&limit=8`);
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: loadingProduct,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    getNextPageParam: (lastPage, pages) => {
      const totalPages = Math.ceil(lastPage.total / 8);
      if (pages.length < totalPages) {
        return pages.length + 1;
      }
      return undefined;
    },
  });

  const products = data?.pages.flatMap((page) => page.products) || [];

  return {
    products,
    loadingProduct,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

export default useProduct;
