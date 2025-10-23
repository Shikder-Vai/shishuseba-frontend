import React, { useState } from "react";
import { motion } from "framer-motion";
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
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import useAllProducts from "../../hooks/useAllProducts";
import Loader from "../../components/Loader";
import ProductModal from "./ProductModal"; // Unified modal
import useCategories from "../../hooks/useCategories";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const Products = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const axiosPublic = useAxiosPublic();

  const [products, loadingProduct, refetch] = useAllProducts();
  const [categories] = useCategories();

  const handleAddModalOpen = () => setShowAddModal(true);
  const handleModalClose = () => {
    setShowAddModal(false);
    setSelectedProduct(null);
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
      const aName = typeof a.name === 'object' ? a.name.en : a.name;
      const bName = typeof b.name === 'object' ? b.name.en : b.name;
      if (aName < bName) return sortConfig.direction === "asc" ? -1 : 1;
      if (aName > bName) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredProducts = getSortedProducts()?.filter((product) => {
    const searchTermLower = searchTerm.toLowerCase();
    const name = typeof product.name === 'object' ? product.name.en : product.name;
    const matchesSearch = name.toLowerCase().includes(searchTermLower);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleUpdateClick = (product) => setSelectedProduct(product);

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
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        await axiosPublic.delete(`/products/${productId}`);
        await refetch();
        Swal.fire("Deleted!", "Your product has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete product.", "error");
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
      className="min-h-screen p-6 bg-brand-cream"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-brand-teal-500">Product Management</h1>
          <button
            onClick={handleAddModalOpen}
            className="btn bg-brand-teal-base hover:bg-brand-teal-500 text-white"
          >
            <PlusCircle size={18} />
            Add Product
          </button>
        </div>

        {(showAddModal || selectedProduct) && (
          <ProductModal
            productId={selectedProduct?._id}
            onClose={handleModalClose}
          />
        )}

        <div className="bg-white rounded-xl shadow-soft overflow-hidden border mb-8">
          <div className="p-4 flex gap-4">
            <input
              type="text"
              placeholder="Search products..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select select-bordered"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat.category}>
                  {cat.en}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-brand-teal-base text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" onClick={() => requestSort('name')}>
                    Product <SortIndicator columnKey="name" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" onClick={() => requestSort('category')}>
                    Category <SortIndicator columnKey="category" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {filteredProducts?.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {typeof product.name === 'object' ? product.name.en : product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={product.image || product.images?.[0]} alt={typeof product.name === 'object' ? product.name.en : product.name} className="h-10 w-10 rounded-md object-cover" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleUpdateClick(product)} className="text-brand-teal-base hover:text-brand-teal-500">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id, (typeof product.name === 'object' ? product.name.en : product.name))} className="ml-4 text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Products;
