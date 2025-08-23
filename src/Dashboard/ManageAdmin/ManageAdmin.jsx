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
  Info
} from "lucide-react";
import useAdminManager from "../../hooks/useAdminManager";

const ManageAdmin = () => {
  const { admins, loading, error, createAdmin, deleteAdmin } = useAdminManager();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [activeTab, setActiveTab] = useState("list");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      Swal.fire({
        title: "Missing Information",
        text: "All fields are required to create an admin",
        icon: "warning",
        confirmButtonColor: "#018b76",
      });
      return;
    }

    const { success, error } = await createAdmin(form.name, form.email, form.password);
    if (success) {
      Swal.fire({
        title: "Success!",
        text: "Admin account created successfully",
        icon: "success",
        confirmButtonColor: "#018b76",
      });
      setForm({ name: "", email: "", password: "" });
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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "This will permanently remove the admin account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#018b76",
      cancelButtonColor: "#6c6c6c",
      confirmButtonText: "Delete Admin",
      cancelButtonText: "Cancel",
      background: "#feefe0",
    });

    if (result.isConfirmed) {
      const { success, error } = await deleteAdmin(id);
      if (success) {
        Swal.fire({
          title: "Deleted!",
          text: "The admin has been removed",
          icon: "success",
          confirmButtonColor: "#018b76",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: error || "Failed to delete admin",
          icon: "error",
          confirmButtonColor: "#018b76",
        });
      }
    }
  };

  // Animation variants
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
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-teal-500 mb-2 flex items-center gap-2">
              <Users size={32} className="text-brand-orange-base" />
              Admin Management
            </h1>
            <p className="text-brand-gray-base">
              Create and manage administrator accounts for your platform
            </p>
          </div>
          
          <button
            onClick={() => setActiveTab(activeTab === "list" ? "create" : "list")}
            className="btn bg-brand-teal-base hover:bg-brand-teal-500 text-white mt-4 md:mt-0 flex items-center gap-2"
          >
            {activeTab === "list" ? (
              <>
                <UserPlus size={18} />
                Add New Admin
              </>
            ) : (
              <>
                <Users size={18} />
                View All Admins
              </>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-brand-gray-light">
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${activeTab === "list" ? "text-brand-teal-base border-b-2 border-brand-teal-base" : "text-brand-gray-base"}`}
              onClick={() => setActiveTab("list")}
            >
              <Users size={18} />
              Admin List
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${activeTab === "create" ? "text-brand-teal-base border-b-2 border-brand-teal-base" : "text-brand-gray-base"}`}
              onClick={() => setActiveTab("create")}
            >
              <PlusCircle size={18} />
              Create Admin
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "create" ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold text-brand-teal-500 mb-6 flex items-center gap-2">
                      <UserPlus size={24} />
                      Create New Admin Account
                    </h2>
                    
                    <form onSubmit={handleCreate} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-gray-base">
                          Full Name
                        </label>
                        <input
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          className="input input-bordered w-full focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-100"
                          value={form.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-gray-base">
                          Email Address
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="admin@example.com"
                          className="input input-bordered w-full focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-100"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-gray-base">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="input input-bordered w-full focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-100"
                          value={form.password}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="btn w-full bg-brand-teal-base hover:bg-brand-teal-500 text-white flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Creating Admin...
                            </>
                          ) : (
                            <>
                              <UserPlus size={18} />
                              Create Admin Account
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    
                    <div className="mt-8 p-4 bg-brand-orange-light rounded-lg border border-brand-orange-base/20">
                      <div className="flex items-start gap-3">
                        <Info size={18} className="text-brand-orange-base mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-brand-gray-base mb-1">Admin Privileges</h4>
                          <p className="text-sm text-brand-gray-base">
                            Admins will have full access to all system settings and user management features.
                            Ensure you only grant admin privileges to trusted individuals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Loading State */}
                  {loading && (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 size={32} className="animate-spin text-brand-teal-base" />
                    </div>
                  )}
                  
                  {/* Error State */}
                  {error && (
                    <div className="p-4 mb-6 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3 text-red-600">
                        <AlertTriangle size={20} />
                        <span className="font-medium">{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Admin List */}
                  {!loading && (
                    <div className="overflow-hidden rounded-lg border border-brand-gray-light">
                      <table className="min-w-full divide-y divide-brand-gray-light">
                        <thead className="bg-brand-teal-base">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              #
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-light">
                          {admins.length > 0 ? (
                            admins.map((admin, index) => (
                              <tr key={admin._id} className="hover:bg-brand-cream/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-gray-base">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-base">
                                  {admin.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-base">
                                  {admin.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-base">
                                  {new Date(admin.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleDelete(admin._id)}
                                    className="text-red-600 hover:text-red-800 flex items-center gap-1 ml-auto"
                                    disabled={loading}
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-brand-gray-base">
                                  <Users size={48} className="text-brand-gray-light mb-4" />
                                  <p className="font-medium">No admin accounts found</p>
                                  <p className="text-sm mt-1">Create your first admin account to get started</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold text-brand-teal-500 mb-4 flex items-center gap-2">
            <Info size={24} />
            Admin Management Guidelines
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal-50 p-2 rounded-full">
                  <UserPlus size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Creating Admins</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Only create admin accounts for trusted team members. Each admin will have full system access.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-brand-orange-light p-2 rounded-full">
                  <AlertTriangle size={18} className="text-brand-orange-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Security</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Ensure admins use strong passwords and enable two-factor authentication for added security.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal-50 p-2 rounded-full">
                  <Trash2 size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Deleting Admins</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Deleting an admin is permanent. The action cannot be undone, so proceed with caution.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal-50 p-2 rounded-full">
                  <Users size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Best Practices</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Maintain at least two admin accounts at all times to prevent lockout situations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageAdmin;