import { useState, useEffect, useRef } from "react";
import { useCart } from "../../hooks/useCart";
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { proceedNow } from "../../hooks/useOrder";
import { useNavigate } from "react-router-dom";
import useScrollToTop from "../../hooks/useScrollToTop";
import SectionTitle from "../../components/SectionTitle";
import {
  pushViewCart,
  pushRemoveFromCart,
} from "../../services/DataLayerService";

const Cart = () => {
  useScrollToTop();
  const [shippingCost, setShippingCost] = useState("80"); // Default to Inside Dhaka
  const [total, setTotal] = useState(0);
  const cart = useCart();
  const navigate = useNavigate();
  const hasFiredViewCart = useRef(false);
  const subtotal = cart?.reduce(
    (sum, i) => sum + parseFloat(i?.price) * i.quantity,
    0
  );

  // --- NEW: useEffect to automatically set shipping cost based on subtotal ---
  useEffect(() => {
    if (subtotal > 1000) {
      setShippingCost("0"); // Set shipping to 0 for free delivery
    } else {
      // Reset to a default when subtotal is no longer eligible for free shipping
      // You can keep the user's previous selection if you prefer more complex logic
      setShippingCost("80");
    }
  }, [subtotal]); // This effect runs whenever the subtotal changes

  // Calculate total when subtotal or shipping changes
  useEffect(() => {
    setTotal(subtotal + parseFloat(shippingCost));
  }, [subtotal, shippingCost]);

  // --- cart view event ---
  useEffect(() => {
    if (cart.length > 0 && !hasFiredViewCart.current) {
      const trackingTotal = subtotal + parseFloat(shippingCost);

      if (trackingTotal > 0) {
        pushViewCart(cart, trackingTotal);
        hasFiredViewCart.current = true;
      }
    }
  }, [cart, subtotal, shippingCost]);
  // --- END ---

  const handleShippingChange = (e) => {
    setShippingCost(e.target.value);
  };
  const handleQuantityChange = (itemId, price, newQuantity) => {
    try {
      const stored = localStorage.getItem("cart");
      const cart = stored ? JSON.parse(stored) : [];

      const updatedCart = cart.reduce((acc, item) => {
        if (item._id === itemId && item?.price === price) {
          const finalQuantity = item?.quantity + newQuantity;
          if (finalQuantity > 0) {
            acc.push({ ...item, quantity: finalQuantity });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Failed to update cart item quantity", error);
    }
  };

  const removeItem = (itemId) => {
    try {
      const stored = localStorage.getItem("cart");
      const cart = stored ? JSON.parse(stored) : [];

      //  TRACKING  REMOVING ITEM ---
      const itemToRemove = cart.find((item) => item._id === itemId);

      if (itemToRemove) {
        pushRemoveFromCart(itemToRemove);
      }
      // --- END ---
      // this comment for new git push

      const updatedCart = cart.filter((item) => item._id !== itemId);

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream min-h-screen">
      <div className="mb-8">
        <SectionTitle title="My Shopping Cart" />
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <ShoppingCart className="w-16 h-16 mx-auto text-brand-gray-light mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-brand-gray-base mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <button
            onClick={() => navigate("/products/all")}
            className="px-6 py-3 bg-brand-teal-base text-white font-medium rounded-lg hover:bg-brand-teal-100 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-brand-gray-light p-4 text-sm font-medium text-brand-gray-base uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={item._id | item?.price}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-0 items-center"
                >
                  {/* Product Info */}
                  <div className="col-span-12 md:col-span-5 flex items-center space-x-4">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-brand-gray-base hover:text-brand-orange-base transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <img
                      src={item?.image}
                      alt={item?.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item?.name}
                      </h3>
                      {item?.weight && (
                        <p className="text-sm text-brand-gray-base">
                          {item.weight}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-4 md:col-span-2 text-brand-gray-base md:text-center">
                    <span className="md:hidden text-sm mr-2">Price:</span>
                    {item?.price}৳
                  </div>

                  {/* Quantity */}
                  <div className="col-span-4 md:col-span-3">
                    <div className="flex items-center justify-center md:justify-center">
                      <button
                        onClick={() =>
                          handleQuantityChange(item?._id, item?.price, -1)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300 text-sm">
                        {item?.quantity}
                      </div>
                      <button
                        onClick={() =>
                          handleQuantityChange(item?._id, item?.price, 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-4 md:col-span-2 text-right font-medium">
                    <span className="md:hidden text-sm mr-2">Subtotal:</span>
                    {item?.price * item.quantity}৳
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => navigate("/products/all")}
                  className="flex items-center text-brand-teal-base hover:text-brand-teal-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h3>

              {/* Subtotal */}
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-brand-gray-base">Subtotal</span>
                <span className="font-medium">{subtotal}৳</span>
              </div>

              <div className="py-4 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Shipping Method
                </h4>
                <div className="space-y-3">
                  {subtotal >= 1000 ? (
                    //  show Free Delivery
                    <label className="flex items-center justify-between p-3 border border-brand-teal-base rounded-lg bg-teal-50 cursor-not-allowed">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="0"
                          checked={true}
                          disabled={true}
                          className="h-4 w-4 text-brand-teal-base focus:ring-brand-teal-base border-gray-300"
                        />
                        <span className="font-semibold text-brand-teal-base">
                          Free Delivery
                        </span>
                      </div>
                      <span className="text-brand-gray-base">0৳</span>
                    </label>
                  ) : (
                    // Otherwise, show standard options
                    <>
                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-brand-teal-base transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="80"
                            checked={shippingCost === "80"}
                            onChange={handleShippingChange}
                            className="h-4 w-4 text-brand-teal-base focus:ring-brand-teal-base border-gray-300"
                          />
                          <span>Inside Dhaka</span>
                        </div>
                        <span className="text-brand-gray-base">80৳</span>
                      </label>
                      <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-brand-teal-base transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="shipping"
                            value="100"
                            checked={shippingCost === "100"}
                            onChange={handleShippingChange}
                            className="h-4 w-4 text-brand-teal-base focus:ring-brand-teal-base border-gray-300"
                          />
                          <span>Outside Dhaka</span>
                        </div>
                        <span className="text-brand-gray-base">100৳</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
              {/* --- END OF MODIFIED SECTION --- */}

              {/* Total */}
              <div className="flex justify-between py-4 mb-6">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-brand-teal-base">
                  {total}৳
                </span>
              </div>

              {/* Proceed Button */}
              <button
                onClick={() =>
                  proceedNow(
                    navigate,
                    subtotal,
                    total,
                    parseFloat(shippingCost)
                  )
                }
                className="w-full py-3 px-6 bg-gradient-to-r from-brand-teal-base to-brand-teal-100 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
              >
                Proceed to Checkout
              </button>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-medium text-gray-900 mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-3">
                <div className="p-2 border border-gray-200 rounded-md">
                  <img
                    src="https://logos-world.net/wp-content/uploads/2024/10/Bkash-Logo.jpg"
                    alt="bKash"
                    className="h-6 object-contain"
                  />
                </div>
                <div className="p-2 border border-gray-200 rounded-md">
                  <img
                    src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png"
                    alt="Nagad"
                    className="h-6 object-contain"
                  />
                </div>
                <div className="p-2 border border-gray-200 rounded-md">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rocket_mobile_banking_logo.svg/320px-Rocket_mobile_banking_logo.svg.png"
                    alt="Rocket"
                    className="h-6 object-contain"
                  />
                </div>
                <div className="p-2 border border-gray-200 rounded-md">
                  <img
                    src="https://seeklogo.com/images/V/VISA-logo-F3440F512B-seeklogo.com.png"
                    alt="Visa"
                    className="h-6 object-contain"
                  />
                </div>
                <div className="p-2 border border-gray-200 rounded-md">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/989px-Mastercard-logo.svg.png"
                    alt="Mastercard"
                    className="h-6 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
