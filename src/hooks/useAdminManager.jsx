import { useState, useEffect } from "react";
import useAxiosPublic from "./useAxiosPublic";

const useAdminManager = () => {
  const axiosPublic = useAxiosPublic();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPublic.get(`/admins`);
      setAdmins(res.data);
    } catch (err) {
      console.error("Fetch Admins Error:", err);
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new admin
  const createAdmin = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosPublic.post(`/register`, {
        name,
        email,
        password,
      });
      await fetchAdmins(); // Refresh after creation
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
      const res = await axiosPublic.delete(`/users/${id}`);
      await fetchAdmins(); // Refresh after deletion
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Delete Admin Error:", err);
      setError(err.response?.data?.message || "Failed to delete admin");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-load admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    loading,
    error,
    fetchAdmins,
    createAdmin,
    deleteAdmin,
  };
};

export default useAdminManager;
