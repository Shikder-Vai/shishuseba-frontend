// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { ShoppingCart, CreditCard, Scale, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { pushAddToCart, pushByNow } from "../../services/DataLayerService";

const ProductCard = ({ product }) => {
  const { name, image, variants, details } = product;
  const navigate = useNavigate();

  const handleBuyNow = (item) => {
    const variant = item.variants[0];
    const price = variant.price;
    const weight = variant.weight;
    const newItem = {
      ...item,
      variant,
      price,
      weight,
      admin_note: "",
      quantity: 1,
    };
    pushByNow(newItem, 1);
    localStorage.setItem("cart", JSON.stringify([newItem]));
    navigate("/cart");
  };

  const handleAddtoCart = (item) => {
    const variant = item.variants[0];
    const price = variant.price;
    const weight = variant.weight;
    const newItem = {
      ...item,
      variant,
      price,
      weight,
      admin_note: "",
      quantity: 1,
    };
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];

    const alreadyExists = currentCart.some(
      (cartItem) => cartItem._id === newItem._id
    );
    if (alreadyExists) {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "Already in cart!",
        showConfirmButton: false,
        background: "#ffffff",
        color: "#6c6c6c",
        timer: 1000,
      });
      return;
    }

    currentCart.push(newItem);
    localStorage.setItem("cart", JSON.stringify(currentCart));
    pushAddToCart(newItem, 1);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Product added to cart!",
      showConfirmButton: false,
      background: "#ffffff",
      color: "#6c6c6c",
      timer: 1000,
    });

    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="flex flex-col justify-between w-full max-w-sm min-h-[440px] bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-brand-gray-light"
    >
      {/* Image Block */}
      <div className="relative h-52 overflow-hidden ">
        <img
          src={image}
          alt={name}
          className="w-full h-full transition-transform duration-300 hover:scale-105 object-fill"
        />
        <Link to={`/product/${product?._id}`}>
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-5 py-2 bg-white text-brand-gray-base font-semibold rounded-full shadow hover:bg-brand-gray-light"
            >
              বিস্তারিত দেখুন
            </motion.button>
          </motion.div>
        </Link>
      </div>

      {/* Content Block */}
      <div className="flex flex-col justify-between flex-grow p-4">
        <Link to={`/product/${product?._id}`}>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-brand-gray-base leading-snug">
              {name?.length > 40 ? name.slice(0, 40) + "..." : name}
            </h3>

            {/* Display first detail if exists */}
            {details?.length > 0 && (
              <div className="flex items-start h-full gap-2 text-sm text-brand-gray-base">
                {/* <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-teal-500" /> */}
                <p>
                  {details[0].length > 60
                    ? details[0].slice(0, 60) + "..."
                    : details[0]}
                </p>
              </div>
            )}
          </div>
        </Link>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between  mx-2">
            <p className="text-brand-teal-base text-lg font-bold">
              {variants[0].price} Tk
            </p>
            <p className="flex items-center gap-1 text-sm text-brand-gray-base">
              <Scale className="w-4 h-4 text-brand-teal-400" />
              {variants[0]?.weight}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => handleAddtoCart(product)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-brand-orange-base text-white hover:bg-brand-orange-base/90 transition-all duration-200 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => handleBuyNow(product)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-brand-teal-base text-white hover:bg-brand-teal-600 transition-all duration-200 shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            অর্ডার করুন
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
