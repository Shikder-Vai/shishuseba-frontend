import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useReviews = () => {
  const axiosPublic = useAxiosPublic();

  const {
    data: reviews = [],
    isLoading: loadingReviews,
    refetch,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await axiosPublic.get("/reviews");
      return res?.data;
    },
  });

  return { reviews, loadingReviews, refetch };
};

export default useReviews;
