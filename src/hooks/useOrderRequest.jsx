import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "./useAxiosPublic";

const useOrderRequest = (statusFilter) => {
  const axiosOublic = useAxiosPublic();

  const {
    data: orders = [],
    isLoading: loadingOrder,
    refetch,
  } = useQuery({
    queryKey: ["order request", statusFilter], // 🟡 Add filter to the key!
    queryFn: async () => {
      const res = await axiosOublic.get("/order-request", {
        params: { status: statusFilter }, // ✅ send value as query param
      });
      return res?.data;
    },
    enabled: !!statusFilter, // optional: only fetch if statusFilter is truthy
  });

  return [orders, loadingOrder, refetch];
};

export default useOrderRequest;
