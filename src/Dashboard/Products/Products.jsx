import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Upload,
  Filter,
  Search,
  Info,
  Edit2,
  Trash2,
  PlusCircle,
  List,
  DollarSign,
  Barcode,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useProduct from "../../hooks/useProducts";
import Loader from "../../components/Loader";
import ProductUploadModal from "./ProductUploadModal";
import UpdateProductModal from "./UpdateProductModal";
import useCategories from "../../hooks/useCategories";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductUploader, setShowProductUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const axiosPublic = useAxiosPublic();

  const [products, loadingProduct, refetch] = useProduct();
  const [categories] = useCategories();

  const handleProductModalOpen = () => setShowProductUploader(true);
  const handleProductModalClose = () => {
    setShowProductUploader(false);
    refetch();
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedProducts = () => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredProducts = getSortedProducts()?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleUpdateClick = (product) => setSelectedProduct(product);
  const closeUpdateModal = () => {
    setSelectedProduct(null);
    refetch();
  };

  const handleDeleteProduct = async (productId, productName) => {
    const result = await Swal.fire({
      title: "Confirm Deletion",
      html: `Delete <strong>${productName}</strong> permanently?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#018b76",
      cancelButtonColor: "#6c6c6c",
      confirmButtonText: "Delete Product",
      cancelButtonText: "Cancel",
      background: "#feefe0",
      customClass: {
        title: "text-brand-teal-500 font-bold",
        htmlContainer: "text-brand-gray-base",
      },
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);

        Swal.fire({
          title: "Deleting...",
          html: "Please wait while we delete the product",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: "#feefe0",
        });

        // Axios returns the response directly in the data property
        const response = await axiosPublic.delete(`/products/${productId}`);

        // With Axios, successful responses (2xx) come here automatically
        // No need to check response.ok like with fetch

        await refetch();

        Swal.fire({
          title: "Deleted!",
          text: "Your product has been deleted.",
          icon: "success",
          confirmButtonColor: "#018b76",
          background: "#feefe0",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            title: "text-brand-teal-500 font-bold",
          },
        });
      } catch (error) {
        console.error("Delete error:", error);
        // Axios wraps the error response in error.response
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to delete product";

        Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#018b76",
          background: "#feefe0",
          customClass: {
            title: "text-brand-orange-base font-bold",
          },
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loadingProduct || isDeleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader />
      </div>
    );
  }

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} className="ml-1" />
    ) : (
      <ChevronDown size={16} className="ml-1" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen p-6 bg-brand-cream"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-3xl font-bold text-brand-teal-500 mb-2 flex items-center gap-3"
            >
              <Package size={32} className="text-brand-orange-base" />
              <span>Product Management</span>
            </motion.h1>
            <p className="text-brand-gray-base">
              Showing {filteredProducts?.length} of {products?.length} products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-brand-gray-base" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2.5 w-full border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-brand-gray-base" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300 appearance-none bg-white transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat.category}>
                      {cat.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleProductModalOpen}
              className="btn bg-brand-teal-base hover:bg-brand-teal-500 text-white flex items-center gap-2 shadow-md"
            >
              <Upload size={18} />
              <span>Import Products</span>
            </motion.button>
          </div>
        </div>

        {/* Product Upload Modal */}
        <ProductUploadModal
          isOpen={showProductUploader}
          onClose={handleProductModalClose}
        />

        {/* Update Product Modal */}

        {selectedProduct && (
          <UpdateProductModal
            productId={selectedProduct._id}
            onClose={closeUpdateModal}
          />
        )}

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-brand-gray-light mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-gray-light">
              <thead className="bg-brand-teal-base">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-brand-teal-500 transition-colors"
                    onClick={() => requestSort("_id")}
                  >
                    <div className="flex items-center">
                      <span>#</span>
                      <SortIndicator columnKey="_id" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-brand-teal-500 transition-colors"
                    onClick={() => requestSort("name")}
                  >
                    <div className="flex items-center">
                      <Package size={16} className="mr-2" />
                      <span>Product</span>
                      <SortIndicator columnKey="name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-brand-teal-500 transition-colors"
                    onClick={() => requestSort("category")}
                  >
                    <div className="flex items-center">
                      <List size={16} className="mr-2" />
                      <span>Category</span>
                      <SortIndicator columnKey="category" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-brand-teal-500 transition-colors"
                    onClick={() => requestSort("sku")}
                  >
                    <div className="flex items-center">
                      <Barcode size={16} className="mr-2" />
                      <span>SKU</span>
                      <SortIndicator columnKey="sku" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white uppercase tracking-wider">
                    <div className="flex items-center">
                      <ImageIcon size={16} className="mr-2" />
                      <span>Image</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-light">
                {filteredProducts?.length > 0 ? (
                  filteredProducts.map((p, i) => (
                    <motion.tr
                      key={p?._id}
                      className="hover:bg-brand-cream/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-gray-base">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-brand-gray-base">
                          {p?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray-base">
                          <span className="bg-brand-teal-50 text-brand-teal-500 px-3 py-1 rounded-full text-xs font-medium">
                            {p?.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray-base font-mono bg-brand-gray-light/30 px-2 py-1 rounded">
                          {p?.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover border border-brand-gray-light shadow-sm"
                            src={p?.image}
                            alt={p?.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/40?text=No+Image";
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleUpdateClick(p)}
                            className="text-brand-teal-base hover:text-brand-teal-500 flex items-center gap-1 p-2 hover:bg-brand-teal-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                            <span className="sr-only">Edit</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteProduct(p._id, p.name)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 p-2 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            <span className="sr-only">Delete</span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-brand-gray-base">
                        <Package
                          size={48}
                          className="text-brand-gray-light mb-4"
                        />
                        <p className="font-medium text-lg">No products found</p>
                        <p className="text-sm mt-2">
                          Try adjusting your search or filter criteria
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleProductModalOpen}
                          className="mt-4 btn bg-brand-teal-base hover:bg-brand-teal-500 text-white flex items-center gap-2"
                        >
                          <PlusCircle size={18} />
                          <span>Add New Product</span>
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats and Quick Actions */}
        {/* Stats and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-soft border border-brand-gray-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-base">Total Products</p>
                <h3 className="text-2xl font-bold text-brand-teal-500">
                  {products?.length}
                </h3>
              </div>
              <div className="bg-brand-teal-50 p-3 rounded-full">
                <Package size={20} className="text-brand-teal-base" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-soft border border-brand-gray-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-base">Categories</p>
                <h3 className="text-2xl font-bold text-brand-teal-500">
                  {categories?.length}
                </h3>
              </div>
              <div className="bg-brand-teal-50 p-3 rounded-full">
                <List size={20} className="text-brand-teal-base" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-soft border border-brand-gray-light">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-base">Filtered</p>
                <h3 className="text-2xl font-bold text-brand-teal-500">
                  {filteredProducts?.length}
                </h3>
              </div>
              <div className="bg-brand-teal-50 p-3 rounded-full">
                <Filter size={20} className="text-brand-teal-base" />
              </div>
            </div>
          </div>
        </div>

        {/* User Guidance Section */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-brand-gray-light">
          <h3 className="text-xl font-semibold text-brand-teal-500 mb-6 flex items-center gap-3">
            <Info size={24} className="text-brand-orange-base" />
            <span>Product Management Guide</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-brand-cream/50 rounded-lg">
                <div className="bg-brand-teal-50 p-2 rounded-full flex-shrink-0">
                  <Search size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base mb-1">
                    Search & Filter
                  </h4>
                  <p className="text-sm text-brand-gray-base">
                    Use the search box to find products by name or SKU. Filter
                    by category to narrow down results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-brand-cream/50 rounded-lg">
                <div className="bg-brand-orange-light p-2 rounded-full flex-shrink-0">
                  <Upload size={18} className="text-brand-orange-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base mb-1">
                    Bulk Import
                  </h4>
                  <p className="text-sm text-brand-gray-base">
                    Import multiple products at once using our CSV template for
                    efficient inventory updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-brand-cream/50 rounded-lg">
                <div className="bg-brand-teal-50 p-2 rounded-full flex-shrink-0">
                  <Edit2 size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base mb-1">
                    Edit Products
                  </h4>
                  <p className="text-sm text-brand-gray-base">
                    Click the edit icon to update product details, pricing,
                    images, and other attributes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-brand-cream/50 rounded-lg">
                <div className="bg-brand-teal-50 p-2 rounded-full flex-shrink-0">
                  <Trash2 size={18} className="text-brand-teal-base" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-gray-base mb-1">
                    Delete Products
                  </h4>
                  <p className="text-sm text-brand-gray-base">
                    Remove products permanently with our confirmation workflow
                    to prevent accidental deletions.
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

export default Products;
