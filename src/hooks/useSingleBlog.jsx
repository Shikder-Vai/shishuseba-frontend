import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useSingleBlog = (id) => {
  const axiosPublic = useAxiosPublic();

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/blogs/${id}`);
      return res.data;
    },
    enabled: !!id, // Only run the query if the id is available
  });

  return { blog, isLoading };
};

export default useSingleBlog;
