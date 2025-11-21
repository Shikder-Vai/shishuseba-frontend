import React, { useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  UserPlus,
  Users,
  Loader2,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react";
import useAdminManager from "../../hooks/useAdminManager";
import { useRole } from "../../hooks/useRole";

const ManageAdmin = () => {
  const {
    users,
    loading,
    error,
    createUser,
    deleteUser,
    updateUserRole,
  } = useAdminManager();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [activeTab, setActiveTab] = useState("list");
  const currentUserRole = useRole();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      Swal.fire({
        title: "Missing Information",
        text: "Name, email, and password are required",
        icon: "warning",
        confirmButtonColor: "#018b76",
      });
      return;
    }

    const { success, error } = await createUser(
      form.name,
      form.email,
      form.password,
      form.role
    );
    if (success) {
      Swal.fire({
        title: "Success!",
        text: "User account created successfully",
        icon: "success",
        confirmButtonColor: "#018b76",
      });
      setForm({ name: "", email: "", password: "", role: "user" });
      setActiveTab("list");
    } else {
      Swal.fire({
        title: "Error",
        text: error || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#018b76",
      });
    }
  };

  const handleDelete = async (id, role) => {
    if (role === "admin") {
      Swal.fire({
        title: "Action Forbidden",
        text: "Admin accounts cannot be deleted.",
        icon: "error",
        confirmButtonColor: "#018b76",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This will permanently remove the user account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c6c6c",
      confirmButtonText: "Delete User",
      cancelButtonText: "Cancel",
      background: "#feefe0",
    });

    if (result.isConfirmed) {
      const { success, error } = await deleteUser(id);
      if (success) {
        Swal.fire({
          title: "Deleted!",
          text: "The user has been removed.",
          icon: "success",
          confirmButtonColor: "#018b76",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: error || "Failed to delete user.",
          icon: "error",
          confirmButtonColor: "#018b76",
        });
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    const { success, error } = await updateUserRole(id, newRole);
    if (success) {
      Swal.fire({
        title: "Success!",
        text: "User role updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Error",
        text: error || "Failed to update role.",
        icon: "error",
        confirmButtonColor: "#018b76",
      });
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen p-6 bg-brand-cream"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-teal-500 mb-2 flex items-center gap-2">
              <Users size={32} className="text-brand-orange-base" />
              User Management
            </h1>
            <p className="text-brand-gray-base">
              Manage all user accounts and roles for your platform.
            </p>
          </div>
          {currentUserRole === "admin" && (
            <button
              onClick={() =>
                setActiveTab(activeTab === "list" ? "create" : "list")
              }
              className="btn bg-brand-teal-base hover:bg-brand-teal-500 text-white mt-4 md:mt-0 flex items-center gap-2"
            >
              {activeTab === "list" ? (
                <>
                  <UserPlus size={18} /> Add New User
                </>
              ) : (
                <>
                  <Users size={18} /> View All Users
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="flex border-b border-brand-gray-light">
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === "list"
                  ? "text-brand-teal-base border-b-2 border-brand-teal-base"
                  : "text-brand-gray-base"
              }`}
              onClick={() => setActiveTab("list")}
            >
              <Users size={18} /> User List
            </button>
            {currentUserRole === "admin" && (
              <button
                className={`px-6 py-3 font-medium flex items-center gap-2 ${
                  activeTab === "create"
                    ? "text-brand-teal-base border-b-2 border-brand-teal-base"
                    : "text-brand-gray-base"
                }`}
                onClick={() => setActiveTab("create")}
              >
                <PlusCircle size={18} /> Create User
              </button>
            )}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "create" && currentUserRole === "admin" ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold text-brand-teal-500 mb-6 flex items-center gap-2">
                      <UserPlus size={24} /> Create New User Account
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-6">
                      <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        className="input input-bordered w-full"
                        value={form.name}
                        onChange={handleChange}
                      />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        className="input input-bordered w-full"
                        value={form.email}
                        onChange={handleChange}
                      />
                      <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="input input-bordered w-full"
                        value={form.password}
                        onChange={handleChange}
                      />
                      <select
                        name="role"
                        className="select select-bordered w-full"
                        value={form.role}
                        onChange={handleChange}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="btn w-full bg-brand-teal-base hover:bg-brand-teal-500 text-white"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create User Account"}
                      </button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {loading && (
                    <div className="flex justify-center py-12">
                      <Loader2
                        size={32}
                        className="animate-spin text-brand-teal-base"
                      />
                    </div>
                  )}
                  {error && (
                    <div className="p-4 text-red-600 bg-red-50 rounded-lg">
                      {error}
                    </div>
                  )}
                  {!loading && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-brand-gray-light">
                        <thead className="bg-brand-teal-base">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-light">
                          {users && users.map((user, index) => (
                            <tr key={user._id}>
                              <td className="px-6 py-4">{index + 1}</td>
                              <td className="px-6 py-4">{user.name}</td>
                              <td className="px-6 py-4">{user.email}</td>
                              <td className="px-6 py-4">
                                <select
                                  value={user.role}
                                  onChange={(e) =>
                                    handleRoleChange(user._id, e.target.value)
                                  }
                                  className="select select-bordered select-sm"
                                  disabled={
                                    loading || currentUserRole !== "admin"
                                  }
                                >
                                  <option value="user">User</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                {new Date(
                                  user.createdAt
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() =>
                                    handleDelete(user._id, user.role)
                                  }
                                  className="btn btn-sm btn-ghost text-red-600"
                                  disabled={
                                    loading ||
                                    user.role === "admin" ||
                                    currentUserRole !== "admin"
                                  }
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageAdmin;
