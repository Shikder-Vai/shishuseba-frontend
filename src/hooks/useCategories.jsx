import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useCategories = () => {
  const axiosOublic = useAxiosPublic();

  const {
    data: categories = [],
    isLoading: loadingCategories,
    refetch,
  } = useQuery({
    queryKey: ["categories",],
    queryFn: async () => {
      const res = await axiosOublic.get("/categories");
      return res?.data;
    },
  });

  return [categories, loadingCategories, refetch];
};

export default useCategories;
