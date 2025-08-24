import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import ProductCard from "../Pages/ProductCard/ProductCard"; // Assuming your card is here

const RelatedProducts = ({ category, currentProductId }) => {
  const axiosPublic = useAxiosPublic();

  const {
    data: relatedProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["relatedProducts", category],
    queryFn: async () => {
      const res = await axiosPublic.get(`/products?category=${category}`);
      return res.data
        .filter((product) => product._id !== currentProductId)
        .slice(0, 4); // Shows a maximum of 4 related products
    },
    enabled: !!category,
  });

  if (isLoading || isError || relatedProducts.length === 0) {
    return null; // Don't show anything if loading, error, or empty
  }

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brand-gray-base">
          Related Products
        </h2>
        <Link
          to={`/category/${category}`}
          className="py-2 px-4 rounded-lg text-sm font-semibold text-brand-teal-base hover:bg-brand-teal-base/10 transition-colors"
        >
          See All &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
