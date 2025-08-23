import Loader from "../../components/Loader";
import SectionTitle from "../../components/SectionTitle";
import useProduct from "../../hooks/useProducts";
import ProductCard from "../ProductCard/ProductCard";

const Featured = () => {
  const [products, loadingProduct] = useProduct();
  if (loadingProduct) {
    return <Loader></Loader>;
  }

  return (
    <div className="py-8 mb-8 max-w-6xl mx-auto">
      <SectionTitle title={"Featured Items"}></SectionTitle>
      <div className="py-8 px-4">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
          {products?.map((product) => (
            <ProductCard key={product?._id} product={product}></ProductCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Featured;
