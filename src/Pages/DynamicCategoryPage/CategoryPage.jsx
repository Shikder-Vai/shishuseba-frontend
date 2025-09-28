import { Link, useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../components/Loader";
import useScrollToTop from "../../hooks/useScrollToTop";
import ProductCard from "../ProductCard/ProductCard";

const CategoryPage = () => {
  useScrollToTop();
  const { categoryName } = useParams();
  const axiosPublic = useAxiosPublic();

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categoryProducts", categoryName],
    queryFn: async () => {
      const res = await axiosPublic.get(`/products?category=${categoryName}`);
      return res.data;
    },
    enabled: !!categoryName,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="text-center py-20">Failed to load products.</div>;
  }

  return (
    <div className="py-8 md:py-12 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-6" aria-label="Breadcrumb">
          {/* ... breadcrumb JSX ... */}
        </nav>

        <h1 className="text-3xl font-bold text-brand-gray-base mb-8 capitalize">
          {categoryName} Products
        </h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-brand-gray-base">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
