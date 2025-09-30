import Loader from "../../components/Loader";
import SectionTitle from "../../components/SectionTitle";
import useProduct from "../../hooks/useProducts";
import ProductCard from "../ProductCard/ProductCard";

const Featured = () => {
  const {
    products,
    loadingProduct,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProduct();

  if (loadingProduct) {
    return <Loader></Loader>;
  }

  return (
    <div className="py-8 mb-8 max-w-6xl mx-auto">
      <SectionTitle title={"আমাদের পণ্য"}></SectionTitle>
      <div className="py-2 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products?.map((product) => (
            <ProductCard key={product?._id} product={product}></ProductCard>
          ))}
        </div>
      </div>
      <div className="text-center">
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-brand-orange-base hover:bg-brand-orange-dark px-6 py-2 rounded-md text-white transition-all shadow-md hover:shadow-brand-orange/40 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? "Loading..." : "আরো পণ্য দেখুন"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Featured;
