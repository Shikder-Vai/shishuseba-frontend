import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  Check, 
  AlertTriangle, 
  X,
  Tag,
  List,
  Info,
  Languages
} from "lucide-react";
import useCategories from "../../hooks/useCategories";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Swal from "sweetalert2";

const Category = () => {
  const axiosPublic = useAxiosPublic();
  const [categories, loadingCategories, refetch, error] = useCategories();
  const [form, setForm] = useState({ bn: "", en: "" });
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ bn: "", en: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id, enName) => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Deletion",
      html: `Delete <strong>${enName}</strong> permanently?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#018b76",
      cancelButtonColor: "#6c6c6c",
      confirmButtonText: "Delete Category",
      cancelButtonText: "Cancel",
      background: "#feefe0"
    });

    if (isConfirmed) {
      try {
        await axiosPublic.delete(`/categories/${id}`);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${enName} has been removed`,
          confirmButtonColor: "#018b76",
          background: "#feefe0",
          timer: 1500,
          showConfirmButton: false
        });
        refetch();
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete category",
          confirmButtonColor: "#018b76",
          background: "#feefe0"
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.bn.trim() || !form.en.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Required Fields",
        text: "Please fill in both name fields",
        confirmButtonColor: "#018b76",
        background: "#feefe0"
      });
    }

    const categoryData = {
      bn: form.bn.trim(),
      en: form.en.trim(),
      category: form.en.replace(/\s+/g, "").toLowerCase()
    };

    try {
      if (editingId) {
        await axiosPublic.put(`/categories/${editingId}`, categoryData);
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `${categoryData.en} updated successfully`,
          confirmButtonColor: "#018b76",
          background: "#feefe0",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axiosPublic.post("/categories", categoryData);
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: `${categoryData.en} added successfully`,
          confirmButtonColor: "#018b76",
          background: "#feefe0",
          timer: 1500,
          showConfirmButton: false
        });
      }
      resetForm();
      refetch();
      setActiveTab("list");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to ${editingId ? 'update' : 'add'} category`,
        confirmButtonColor: "#018b76",
        background: "#feefe0"
      });
    }
  };

  const handleEdit = (category) => {
    setForm({
      bn: category.bn,
      en: category.en
    });
    setEditingId(category._id);
    setIsFormOpen(true);
    setActiveTab("form");
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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-teal-500 mb-2 flex items-center gap-2">
              <List size={32} className="text-brand-orange-base" />
              Category Management
            </h1>
            <p className="text-brand-gray-base">
              Organize and manage your content categories in both English and Bangla
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setActiveTab(activeTab === "list" ? "form" : "list");
            }}
            className="btn bg-brand-teal-base hover:bg-brand-teal-500 text-white mt-4 md:mt-0 flex items-center gap-2"
          >
            {activeTab === "list" ? (
              <>
                <Tag size={18} />
                Add New Category
              </>
            ) : (
              <>
                <List size={18} />
                View All Categories
              </>
            )}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-brand-gray-light">
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${activeTab === "list" ? "text-brand-teal-base border-b-2 border-brand-teal-base" : "text-brand-gray-base"}`}
              onClick={() => setActiveTab("list")}
            >
              <List size={18} />
              Category List
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${activeTab === "form" ? "text-brand-teal-base border-b-2 border-brand-teal-base" : "text-brand-gray-base"}`}
              onClick={() => {
                resetForm();
                setActiveTab("form");
              }}
            >
              <Tag size={18} />
              {editingId ? "Edit Category" : "Add Category"}
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "form" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold text-brand-teal-500 mb-6 flex items-center gap-2">
                      <Tag size={24} />
                      {editingId ? "Edit Category" : "Create New Category"}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-gray-base flex items-center gap-2">
                          <Languages size={16} />
                          English Name
                        </label>
                        <input
                          name="en"
                          type="text"
                          placeholder="e.g. Technology"
                          className="input input-bordered w-full focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-100"
                          value={form.en}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-brand-gray-base flex items-center gap-2">
                          <Languages size={16} />
                          Bangla Name
                        </label>
                        <input
                          name="bn"
                          type="text"
                          placeholder="e.g. প্রযুক্তি"
                          className="input input-bordered w-full focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-100"
                          value={form.bn}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="pt-2 flex gap-3">
                        <button
                          type="submit"
                          className="btn flex-1 bg-brand-teal-base hover:bg-brand-teal-500 text-white flex items-center justify-center gap-2"
                        >
                          <Check size={18} />
                          {editingId ? "Update Category" : "Add Category"}
                        </button>
                        
                        {editingId && (
                          <button
                            type="button"
                            onClick={() => {
                              resetForm();
                              setActiveTab("list");
                            }}
                            className="btn btn-ghost text-brand-gray-base"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                    
                    <div className="mt-8 p-4 bg-brand-orange-light rounded-lg border border-brand-orange-base/20">
                      <div className="flex items-start gap-3">
                        <Info size={18} className="text-brand-orange-base mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-brand-gray-base mb-1">Category Slug</h4>
                          <p className="text-sm text-brand-gray-base">
                            The system will automatically generate a URL-friendly slug from the English name.
                            For example: "Technology News" becomes "technologynews".
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
                  {loadingCategories && (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 size={32} className="animate-spin text-brand-teal-base" />
                    </div>
                  )}
                  
                  {/* Error State */}
                  {error && (
                    <div className="p-4 mb-6 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3 text-red-600">
                        <AlertTriangle size={20} />
                        <span className="font-medium">Error loading categories</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Category List */}
                  {!loadingCategories && (
                    <div className="overflow-hidden rounded-lg border border-brand-gray-light">
                      <table className="min-w-full divide-y divide-brand-gray-light">
                        <thead className="bg-brand-teal-base">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              #
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              English Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Bangla Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Slug
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-light">
                          {categories.length > 0 ? (
                            categories.map((cat, index) => (
                              <tr key={cat._id} className="hover:bg-brand-cream/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-gray-base">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-base">
                                  {cat.en}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-base">
                                  {cat.bn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-base">
                                  <code className="bg-brand-gray-light px-2 py-1 rounded text-xs">
                                    {cat.category}
                                  </code>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEdit(cat)}
                                      className="text-brand-teal-base hover:text-brand-teal-500 flex items-center gap-1"
                                    >
                                      <Edit2 size={16} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(cat._id, cat.en)}
                                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                    >
                                      <Trash2 size={16} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-brand-gray-base">
                                  <Tag size={48} className="text-brand-gray-light mb-4" />
                                  <p className="font-medium">No categories found</p>
                                  <p className="text-sm mt-1">Create your first category to get started</p>
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
            Category Management Guidelines
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal-50 p-2 rounded-full">
                  <Tag size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Creating Categories</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Provide both English and Bangla names for each category to support bilingual content.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-brand-orange-light p-2 rounded-full">
                  <AlertTriangle size={18} className="text-brand-orange-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Important Notes</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Deleting a category will not delete associated content, but may affect content organization.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal-50 p-2 rounded-full">
                  <Edit2 size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Editing Categories</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Changing a category name will update it everywhere it's used, but the slug may remain the same.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-brand-teal-50 p-2 rounded-full">
                  <Languages size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base">Best Practices</h4>
                  <p className="text-sm text-brand-gray-base mt-1">
                    Keep category names concise but descriptive in both languages for better user experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            resetForm();
            setActiveTab(activeTab === "list" ? "form" : "list");
          }}
          className="bg-brand-orange-base text-white p-4 rounded-full shadow-lg"
          aria-label={activeTab === "list" ? "Add category" : "View categories"}
        >
          {activeTab === "list" ? <Plus size={24} /> : <List size={24} />}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Category;