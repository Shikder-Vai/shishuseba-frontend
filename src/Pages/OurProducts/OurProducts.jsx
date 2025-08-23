// Optimized OurProducts.jsx with fixed sidebar and scrollable product grid
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useCategories from "../../hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import ProductCard from "../ProductCard/ProductCard";
import useScrollToTop from "../../hooks/useScrollToTop";

const OurProducts = () => {
  useScrollToTop();
  const { category: categoryFromUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories] = useCategories();
  const axiosPublic = useAxiosPublic();

  // Optimized category setting
  useEffect(() => {
    if (!categoryFromUrl) {
      navigate("/products/all", { replace: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl, navigate]);

  // Fetch products with cache and loading states
  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: async () => {
      if (selectedCategory === "all") {
        const res = await axiosPublic.get("/products");
        return res.data;
      } else {
        const res = await axiosPublic.get(
          `/products/category/${selectedCategory}`
        );
        return res.data;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    keepPreviousData: true, // Keep previous data while fetching new
  });

  const handleCategoryChange = (category) => {
    // Skip unnecessary navigation if same category
    if (category !== selectedCategory) {
      setSelectedCategory(category);
      navigate(`/products/${category}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] max-w-7xl mx-auto py-8">
      {/* Fixed Sidebar for desktop */}
      <div className="hidden md:flex md:w-1/4 lg:w-1/5 h-full flex-col border-r border-gray-200 bg-white">
        <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-200">
          <h2 className="font-bold text-xl text-brand-teal-base">
            Product Categories
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {/* All Categories option */}
          <div
            onClick={() => handleCategoryChange("all")}
            className={`cursor-pointer px-4 py-3 rounded-lg transition-all ${
              selectedCategory === "all"
                ? "bg-brand-teal-50 border-l-4 border-brand-teal-base text-brand-teal-base font-semibold"
                : "hover:bg-brand-teal-50 text-brand-gray-base"
            }`}
          >
            <span className="flex items-center gap-2">
              {selectedCategory === "all" && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              All Products
            </span>
          </div>
          
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => handleCategoryChange(cat.category)}
              className={`cursor-pointer px-4 py-3 rounded-lg transition-all ${
                selectedCategory === cat.category
                  ? "bg-brand-teal-50 border-l-4 border-brand-teal-base text-brand-teal-base font-semibold"
                  : "hover:bg-brand-teal-50 text-brand-gray-base"
              }`}
            >
              <span className="flex items-center gap-2">
                {selectedCategory === cat.category && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {cat.bn} | {cat.en}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown for mobile */}
      <div className="block md:hidden w-full p-4 sticky top-0 bg-white z-10 border-b border-gray-200">
        <label className="block mb-2 font-semibold text-brand-orange-base">
          Select Category
        </label>
        <select
          value={selectedCategory || "all"}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full border border-brand-orange-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange-light bg-white shadow-sm"
        >
          <option value="all">All Products</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.category}>
              {cat.bn} | {cat.en}
            </option>
          ))}
        </select>
      </div>

      {/* Scrollable Product Grid */}
      <div className="md:w-3/4 lg:w-4/5 w-full overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-teal-base">
              {selectedCategory === "all"
                ? "All Products"
                : categories.find((cat) => cat.category === selectedCategory)?.bn}
              <span className="ml-2 text-sm font-normal text-brand-gray-base">
                ({products.length} items)
              </span>
            </h2>
            
            {(isFetching && !isLoading) && (
              <div className="text-sm text-brand-gray-base flex items-center">
                <span className="mr-2">Updating...</span>
                <div className="w-4 h-4 border-t-2 border-brand-orange-base border-solid rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : products.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-16 h-16 text-brand-gray-light mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-brand-gray-base mb-2">No products found</h3>
              <p className="text-brand-gray-light max-w-md">
                We couldn't find any products in this category. Try selecting a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OurProducts;