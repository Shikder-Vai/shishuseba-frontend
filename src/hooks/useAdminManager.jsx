import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "./useAxiosSecure";

const useAdminManager = () => {
  const axiosSecure = useAxiosSecure();
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch all admin (stable reference via useCallback)
  const fetchAdmin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.get(`/admin`);
      setAdmin(res.data);
    } catch (err) {
      console.error("Fetch Admin Error:", err);
      setError("Failed to load admin");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // ✅ Create new admin
  const createAdmin = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.post(`/register`, {
        name,
        email,
        password,
      });
      await fetchAdmin(); // Refresh after creation
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Create Admin Error:", err);
      setError(err.response?.data?.message || "Failed to create admin");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete admin
  const deleteAdmin = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.delete(`/users/${id}`);
      await fetchAdmin(); // Refresh after deletion
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Delete Admin Error:", err);
      setError(err.response?.data?.message || "Failed to delete admin");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-load admin
  useEffect(() => {
    fetchAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    admin,
    loading,
    error,
    fetchAdmin,
    createAdmin,
    deleteAdmin,
  };
};

export default useAdminManager;
