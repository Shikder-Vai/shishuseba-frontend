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
    const price = parseFloat(variant.price);
    const weight = variant.weight;
    const quantity = 1;

    const newItem = {
      ...item,
      variant,
      price,
      weight,
      admin_note: "",
      quantity: quantity,
    };

    // GTM event
    pushByNow(newItem, quantity);

    // Create cart and order objects for checkout
    const cartItems = [newItem];
    const subtotal = price * quantity;
    const shippingCost = subtotal >= 1000 ? 0 : 80; // Same logic as in Cart.jsx
    const total = subtotal + shippingCost;

    const order = {
      items: cartItems,
      subtotal,
      shippingCost,
      total,
    };

    // Set both cart and order for consistency, then navigate
    localStorage.setItem("cart", JSON.stringify(cartItems));
    localStorage.setItem("order", JSON.stringify(order));
    navigate("/checkout");
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
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col"
    >
      {/* Image with overlay */}
      <div className="relative">
        <div className="w-full h-28 overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300" />
        </div>
        <Link to={`/product/${product?._id}`} className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold shadow-lg">View Details</span>
        </Link>
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="font-semibold text-xs text-gray-800 truncate mb-0.5">{name}</h3>
            <p className="text-xs text-gray-500">{variants[0]?.weight}</p>
            {/* Display first detail if exists */}
            {details?.length > 0 && (
              <div className="hidden md:block items-start h-full gap-2 text-sm text-brand-gray-base">
                {/* <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-teal-500" /> */}
                <p>
                  {details[0].length > 60
                    ? details[0].slice(0, 60) + "..."
                    : details[0]}
                </p>
              </div>
            )}
        </div>

        {/* Price */}
        <div className="mt-2">
          <p className="font-bold text-brand-teal-base text-base">{variants[0].price} Tk</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
             <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddtoCart(product)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-md bg-brand-orange-base text-white hover:bg-brand-orange-base/90 transition-all"
                title="Add to Cart"
              >
                <ShoppingCart size={14} />
                <span className="hidden md:inline">Add to Cart</span>
              </motion.button>
             <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBuyNow(product)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-md bg-brand-teal-base text-white hover:bg-brand-teal-600 transition-all"
                title="Buy Now"
              >
                <CreditCard size={14} />
                <span className="hidden md:inline">Buy Now</span>
              </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;