import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "./useAxiosSecure";

const useAdminManager = () => {
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.get(`/admin`);
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // Create new user
  const createUser = async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.post(`/register`, {
        name,
        email,
        password,
        role,
      });
      await fetchUsers(); // Refresh after creation
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Create User Error:", err);
      setError(err.response?.data?.message || "Failed to create user");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.delete(`/users/${id}`);
      await fetchUsers(); // Refresh after deletion
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Delete User Error:", err);
      setError(err.response?.data?.message || "Failed to delete user");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (id, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.put(`/users/role/${id}`, { role });
      await fetchUsers(); // Refresh after update
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Update Role Error:", err);
      setError(err.response?.data?.message || "Failed to update role");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Auto-load users
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    deleteUser,
    updateUserRole,
  };
};

export default useAdminManager;
