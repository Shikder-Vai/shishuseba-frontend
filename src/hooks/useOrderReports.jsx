// hooks/useOrderReports.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useOrderReports = () => {
  // State for all report data
  const [reports, setReports] = useState({
    salesPerformance: null,
    orderStatusSummary: null,
    productPerformance: null,
    districtWiseOrders: null,
    customerInsights: null,
    districts: [],
  });

  const [loading, setLoading] = useState({
    salesPerformance: false,
    orderStatusSummary: false,
    productPerformance: false,
    districtWiseOrders: false,
    customerInsights: false,
    districts: false,
  });

  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    district: "all",
  });

  // Base API path from your app.js
  // const API_BASE = 'http://31.97.233.143:5000/v1/reports';
  const API_BASE = "https://api.shishuseba.com/v1/reports";
  // const API_BASE = "http://localhost:5000/v1/reports";

  // Fetch all unique districts for dropdown
  const fetchDistricts = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, districts: true }));
      const response = await axios.get(`${API_BASE}/districts`);
      setReports((prev) => ({ ...prev, districts: response.data }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch districts");
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  }, [API_BASE]);

  // Fetch sales performance report
  const fetchSalesPerformance = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, salesPerformance: true }));
      const params = {
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        district: filters.district !== "all" ? filters.district : undefined,
      };
      const response = await axios.get(`${API_BASE}/sales-performance`, {
        params,
      });
      setReports((prev) => ({ ...prev, salesPerformance: response.data }));
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch sales performance"
      );
    } finally {
      setLoading((prev) => ({ ...prev, salesPerformance: false }));
    }
  }, [API_BASE, filters.district, filters.endDate, filters.startDate]);

  // Fetch order status summary
  const fetchOrderStatusSummary = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, orderStatusSummary: true }));
      const params = {
        district: filters.district !== "all" ? filters.district : undefined,
      };
      const response = await axios.get(`${API_BASE}/order-status-summary`, {
        params,
      });
      setReports((prev) => ({ ...prev, orderStatusSummary: response.data }));
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch order status summary"
      );
    } finally {
      setLoading((prev) => ({ ...prev, orderStatusSummary: false }));
    }
  }, [API_BASE, filters.district]);

  // Fetch product performance
  const fetchProductPerformance = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, productPerformance: true }));
      const params = {
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        district: filters.district !== "all" ? filters.district : undefined,
      };
      const response = await axios.get(`${API_BASE}/product-performance`, {
        params,
      });
      setReports((prev) => ({ ...prev, productPerformance: response.data }));
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch product performance"
      );
    } finally {
      setLoading((prev) => ({ ...prev, productPerformance: false }));
    }
  }, [API_BASE, filters.district, filters.endDate, filters.startDate]);

  // Fetch district-wise orders
  const fetchDistrictWiseOrders = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, districtWiseOrders: true }));
      const params = {
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      };
      const response = await axios.get(`${API_BASE}/district-wise-orders`, {
        params,
      });
      setReports((prev) => ({ ...prev, districtWiseOrders: response.data }));
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch district-wise orders"
      );
    } finally {
      setLoading((prev) => ({ ...prev, districtWiseOrders: false }));
    }
  }, [API_BASE, filters.endDate, filters.startDate]);

  // Fetch customer insights
  const fetchCustomerInsights = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, customerInsights: true }));
      const params = {
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        district: filters.district !== "all" ? filters.district : undefined,
      };
      const response = await axios.get(`${API_BASE}/customer-insights`, {
        params,
      });
      setReports((prev) => ({ ...prev, customerInsights: response.data }));
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch customer insights"
      );
    } finally {
      setLoading((prev) => ({ ...prev, customerInsights: false }));
    }
  }, [API_BASE, filters.district, filters.endDate, filters.startDate]);

  // Fetch all reports at once
  const fetchAllReports = useCallback(async () => {
    await Promise.all([
      fetchSalesPerformance(),
      fetchOrderStatusSummary(),
      fetchProductPerformance(),
      fetchDistrictWiseOrders(),
      fetchCustomerInsights(),
    ]);
  }, [
    fetchCustomerInsights,
    fetchDistrictWiseOrders,
    fetchOrderStatusSummary,
    fetchProductPerformance,
    fetchSalesPerformance,
  ]);

  // Update filters and refetch affected reports
  const updateFilters = useCallback(
    (newFilters) => {
      setFilters((prev) => {
        const updatedFilters = { ...prev, ...newFilters };

        // Determine which reports need to be refetched based on what changed
        const shouldRefetchSales =
          newFilters.startDate !== undefined ||
          newFilters.endDate !== undefined ||
          newFilters.district !== undefined;

        const shouldRefetchProducts =
          newFilters.startDate !== undefined ||
          newFilters.endDate !== undefined ||
          newFilters.district !== undefined;

        const shouldRefetchCustomers =
          newFilters.startDate !== undefined ||
          newFilters.endDate !== undefined ||
          newFilters.district !== undefined;

        const shouldRefetchDistricts =
          newFilters.startDate !== undefined ||
          newFilters.endDate !== undefined;

        const shouldRefetchStatus = newFilters.district !== undefined;

        // Refetch reports as needed
        if (shouldRefetchSales) fetchSalesPerformance();
        if (shouldRefetchProducts) fetchProductPerformance();
        if (shouldRefetchCustomers) fetchCustomerInsights();
        if (shouldRefetchDistricts) fetchDistrictWiseOrders();
        if (shouldRefetchStatus) fetchOrderStatusSummary();

        return updatedFilters;
      });
    },
    [
      fetchCustomerInsights,
      fetchDistrictWiseOrders,
      fetchOrderStatusSummary,
      fetchProductPerformance,
      fetchSalesPerformance,
    ]
  );

  // Initialize by fetching districts and all reports
  useEffect(() => {
    fetchDistricts();
    fetchAllReports();
  }, [fetchAllReports, fetchDistricts]);

  return {
    reports,
    loading,
    error,
    filters,
    fetchAllReports,
    fetchSalesPerformance,
    fetchOrderStatusSummary,
    fetchProductPerformance,
    fetchDistrictWiseOrders,
    fetchCustomerInsights,
    updateFilters,
  };
};

export default useOrderReports;
