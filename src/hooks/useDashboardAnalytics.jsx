import { useQuery } from '@tanstack/react-query';
import useAxiosPublic from './useAxiosPublic';

const useDashboardAnalytics = (options = {}) => {
  const axiosPublic = useAxiosPublic(); // ✅ Use the hook
  const {
    timeframe = 'monthly',
    startDate,
    endDate,
    district,
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['dashboard-analytics', { timeframe, startDate, endDate, district }],
    queryFn: async () => {
      const { data } = await axiosPublic.get('/v1/dashboard/analytics', {
        params: { timeframe, startDate, endDate, district },
      });
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });
};

const useProductPerformance = (options = {}) => {
  const axiosPublic = useAxiosPublic();
  const {
    productName,
    timeframe = 'monthly',
    enabled = true
  } = options;

  return useQuery({
    queryKey: ['product-performance', { productName, timeframe }],
    queryFn: async () => {
      const { data } = await axiosPublic.get('/v1/dashboard/products', {
        params: { productName, timeframe },
      });
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });
};

const useDashboardSummary = () => {
  const axiosPublic = useAxiosPublic();

  const dailyQuery = useDashboardAnalytics({ timeframe: 'daily' });
  const weeklyQuery = useDashboardAnalytics({ timeframe: 'weekly' });
  const monthlyQuery = useDashboardAnalytics({ timeframe: 'monthly' });
  const yearlyQuery = useDashboardAnalytics({ timeframe: 'yearly' });

  const popularProductsQuery = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
      const { data } = await axiosPublic.get('/v1/dashboard/analytics');
      return data.metrics.popularProducts;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    daily: dailyQuery.data?.timeframeReport || [],
    weekly: weeklyQuery.data?.timeframeReport || [],
    monthly: monthlyQuery.data?.timeframeReport || [],
    yearly: yearlyQuery.data?.timeframeReport || [],
    popularProducts: popularProductsQuery.data || [],
    isLoading: dailyQuery.isLoading || weeklyQuery.isLoading || 
               monthlyQuery.isLoading || yearlyQuery.isLoading || 
               popularProductsQuery.isLoading,
    isError: dailyQuery.isError || weeklyQuery.isError || 
             monthlyQuery.isError || yearlyQuery.isError || 
             popularProductsQuery.isError,
    error: dailyQuery.error || weeklyQuery.error || 
           monthlyQuery.error || yearlyQuery.error || 
           popularProductsQuery.error
  };
};

export { useDashboardAnalytics, useProductPerformance, useDashboardSummary };
