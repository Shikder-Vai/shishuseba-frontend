import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useOrderFromLocalStorage from "../../hooks/useOrderFromLocalStorage";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Phone,
  User,
  Info,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  ChevronDown,
  X,
} from "lucide-react";
import useScrollToTop from "../../hooks/useScrollToTop";
import { pushBeginCheckout } from "../../services/DataLayerService";

const Checkout = () => {
  useScrollToTop();
  const order = useOrderFromLocalStorage();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasFiredBeginCheckout = useRef(false);
  const [shippingCost, setShippingCost] = useState("80");
  const [total, setTotal] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (order) {
      const subtotal = order.subtotal || 0;
      const initialShipping = subtotal >= 1000 ? "0" : "80";
      setShippingCost(initialShipping);
      setTotal(subtotal + parseFloat(initialShipping));
    }
  }, [order]);

  useEffect(() => {
    if (order) {
      setTotal(order.subtotal + parseFloat(shippingCost));
    }
  }, [shippingCost, order]);

  // --- CHECKOUT PAGE VIEW ---
  useEffect(() => {
    if (order?.items?.length > 0 && !hasFiredBeginCheckout.current) {
      pushBeginCheckout(order.items, total);
      hasFiredBeginCheckout.current = true;
    }
  }, [order, total]);
  // --- END ---

  // Load districts data
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await fetch("/district.json");
        const data = await response.json();
        setDistricts(data);
        setFilteredDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
      }
    };

    loadDistricts();
  }, []);

  // Filter districts based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDistricts(districts);
    } else {
      const filtered = districts.filter(
        (district) =>
          district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          district.bn_name.includes(searchTerm)
      );
      setFilteredDistricts(filtered);
    }
  }, [searchTerm, districts]);

  const handleDistrictSelect = (district) => {
    setValue("district", district.name);
    setSearchTerm(district.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setValue("district", "");
    setSearchTerm("");
    setShowDropdown(true);
  };

  const handleShippingChange = (e) => {
    setShippingCost(e.target.value);
  };

  const handleOrder = async (data) => {
    setIsSubmitting(true);

    try {
      // Generate unique 8-digit ID combining date, time, and phone
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const phoneLast4 = data.mobile.slice(-4);

      // Combine components and take first 8 digits
      const uniqueId = `${day}${month}${minutes}${seconds}${phoneLast4}`.slice(
        0,
        8
      );

      const newOrder = {
        ...order,
        orderId: uniqueId, // Add the unique ID here
        status: "pending",
        shippingCost: parseFloat(shippingCost),
        total: total,
        user: {
          ...data,
          orderDate: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        },
      };

      const res = await axiosPublic.post("/order", newOrder);

      if (res?.data?.insertedId) {
        localStorage.clear();
        window.dispatchEvent(new Event("cart-updated"));
        navigate("/order-success", { state: newOrder });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Your order has been placed",
          showConfirmButton: false,
          confirmButtonColor: "#018b76",
          background: "white",
          color: "#333333",
          timer: 1500,
        });
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Order failed",
        text: "Please try again",
        confirmButtonColor: "#018b76",
        background: "white",
        color: "#333333",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-brand-cream">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing & Shipping Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <MapPin className="w-6 h-6 text-brand-teal-base" />
            Billing & Shipping Details
          </h2>

          <form onSubmit={handleSubmit(handleOrder)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-gray-base" />
                Full Name{" "}
                <span className="text-xs text-brand-teal-400">(পূর্ণ নাম)</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-teal-base focus:border-brand-teal-base ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your full name"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4 " />
                Phone Number{" "}
                <span className="text-xs text-brand-teal-400">
                  (১১ ডিজিটঃ 017XXXXXXXX)
                </span>
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-teal-base focus:border-brand-teal-base ${
                  errors.mobile ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your phone number"
                {...register("mobile", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^01[3-9]\d{8}$/,
                    message: "Enter a valid Bangladeshi phone number",
                  },
                })}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gray-base" />
                Complete Address{" "}
                <span className="text-xs text-brand-teal-400">
                  (গ্রাম, ইউনিয়ন, থানা, জেলা)
                </span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-teal-base focus:border-brand-teal-base ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="House #, Road #, Area, etc."
                {...register("address")}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* District Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-gray-base" />
                District
              </label>
              <div className="relative">
                <div className="flex items-center relative">
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-teal-base focus:border-brand-teal-base ${
                      errors.district ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Search or select district"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="absolute right-10 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                <input type="hidden" {...register("district")} />

                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((district) => (
                        <div
                          key={district.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                          onClick={() => handleDistrictSelect(district)}
                        >
                          <span>{district.name}</span>
                          <span className="text-gray-500">
                            {district.bn_name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        No districts found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Country Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                Bangladesh
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-gray-base" />
                Order Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-base focus:border-brand-teal-base"
                rows="4"
                placeholder="Special instructions for delivery..."
                {...register("notes")}
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-brand-teal-base" />
            Order Summary
          </h2>

          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div>Product</div>
              <div className="text-right">Subtotal</div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order?.items?.map((item) => (
              <div
                key={item?._id}
                className="grid grid-cols-2 gap-4 items-center"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                    <img
                      src={item?.image}
                      alt={item?.name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.weight}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item?.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right font-medium">
                  {item?.price * item?.quantity}৳
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Method */}
          <div className="py-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Shipping Method
            </h4>
            <div className="space-y-3">
              {order?.subtotal >= 1000 ? (
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

          {/* Order Totals */}
          <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{order?.subtotal}৳</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{shippingCost}৳</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold text-brand-teal-base">
                {total}৳
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-8 bg-brand-cream rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-5 h-5 text-brand-orange-base" />
              <h3 className="font-semibold">Payment Method</h3>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
              <input
                type="radio"
                id="cod"
                name="payment"
                className="h-4 w-4 text-brand-teal-base focus:ring-brand-teal-base border-gray-300"
                defaultChecked
              />
              <label htmlFor="cod" className="flex-1">
                <div className="font-medium">Cash on Delivery</div>
                <p className="text-sm text-gray-600 mt-1">
                  Pay with cash upon delivery
                </p>
              </label>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handleSubmit(handleOrder)}
            disabled={isSubmitting}
            className={`w-full mt-6 py-4 px-6 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-gray-400"
                : "bg-gradient-to-r from-brand-teal-base to-brand-teal-100 hover:opacity-90"
            } transition-all duration-200 shadow-md`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Place Order
              </>
            )}
          </button>

          {/* Delivery Info */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Truck className="w-5 h-5 text-brand-orange-base mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Delivery Information</h4>
              <p className="text-sm text-gray-600">
                Orders are typically delivered within 2-3 business days. You'll
                receive a confirmation call before delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;