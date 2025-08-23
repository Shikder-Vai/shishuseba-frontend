import React, { useState } from "react";
import {
  FiSearch,
  FiTruck,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiX,
  FiMapPin,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import useScrollToTop from "../../hooks/useScrollToTop";

const TrackOrder = () => {
  useScrollToTop();
  const [orderId, setOrderId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const axiosPublic = useAxiosPublic();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setIsFetching(true);
    try {
      const response = await axiosPublic.get(`/order/track/${orderId}`);
      setIsLoading(true);
      if (!response.data) {
        setIsLoading(false);
        throw new Error("No data received");
      }
      setTrackingData(response.data.order);
      setIsModalOpen(true);
    } catch (error) {
      setIsLoading(false);
      console.error("Tracking error:", error);
      Swal.fire({
        title: "Order Not Found",
        text:
          error.response?.data?.message ||
          "Please check your order ID and try again",
        icon: "error",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
      });
      setTrackingData(null);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-brand-teal-base mb-4">
            Track Your Order
          </h1>
          <p className="text-xl text-brand-gray-base max-w-3xl mx-auto">
            Enter your order ID below to check the current status of your
            delivery.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-xl shadow-soft p-8 max-w-2xl mx-auto mb-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="orderId"
                className="block text-lg font-medium text-brand-gray-base mb-2"
              >
                Order ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent"
                  placeholder="e.g. ORD-123456"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-teal-base text-white p-2 rounded-lg hover:bg-brand-teal-300 transition-colors"
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <FiSearch className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-brand-gray-base">
                You can find your order ID in your confirmation email.
              </p>
            </div>
          </form>
        </div>

        {/* Additional Information Sections */}
        {/* ... (keep your existing info sections) ... */}

        {/* Tracking Modal */}
        <AnimatePresence>
          {isModalOpen && trackingData && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="sticky top-0 bg-white p-6 border-b border-brand-gray-light flex justify-between items-center z-10">
                  <h2 className="text-2xl font-semibold text-brand-teal-base">
                    Order Tracking - {trackingData.orderId || "N/A"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-brand-gray-base hover:text-brand-orange-base"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="p-6">
                  {/* Order Summary */}
                  {trackingData.user && (
                    <div className="bg-brand-cream/30 p-6 rounded-xl mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-brand-gray-base mb-2">
                            Order Date
                          </h3>
                          <p className="text-lg font-semibold">
                            {trackingData.user.orderDate || "Not available"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-brand-gray-base mb-2">
                            Shipping Cost
                          </h3>
                          <p className="text-lg font-semibold">
                            {trackingData.shippingCost
                              ? `${trackingData.shippingCost} BDT`
                              : "Not available"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-brand-gray-base mb-2">
                            Status
                          </h3>
                          <p
                            className={`text-lg font-semibold ${
                              trackingData.status === "shipped"
                                ? "text-brand-teal-base"
                                : trackingData.status === "delivered"
                                ? "text-green-500"
                                : "text-brand-orange-base"
                            }`}
                          >
                            {trackingData.status
                              ? trackingData.status.charAt(0).toUpperCase() +
                                trackingData.status.slice(1)
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-brand-gray-base mb-6">
                      Order Timeline
                    </h3>
                    <div className="relative">
                      <div className="absolute left-5 top-0 h-full w-0.5 bg-brand-teal-100"></div>
                      <div className="space-y-8">
                        {/* Approved Step */}
                        {trackingData.approvedBy && (
                          <div className="relative pl-12">
                            <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-brand-teal-base transform -translate-x-1/2"></div>
                            <div className="p-4 rounded-lg bg-brand-teal-50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-brand-teal-base">
                                  Approved
                                </h4>
                                <FiCheckCircle className="text-brand-teal-base" />
                              </div>
                              <p className="text-brand-gray-base mb-1">
                                Your order has been approved
                              </p>
                              <p className="text-sm text-brand-gray-base">
                                <FiClock className="inline mr-1" />
                                {trackingData.approvedBy.approvedTime ||
                                  "Not available"}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Processing Step */}
                        {trackingData.processBy && (
                          <div className="relative pl-12">
                            <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-brand-teal-base transform -translate-x-1/2"></div>
                            <div className="p-4 rounded-lg bg-brand-teal-50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-brand-teal-base">
                                  Processing
                                </h4>
                                <FiCheckCircle className="text-brand-teal-base" />
                              </div>
                              <p className="text-brand-gray-base mb-1">
                                Your order is being prepared
                              </p>
                              <p className="text-sm text-brand-gray-base">
                                <FiClock className="inline mr-1" />
                                {trackingData.processBy.processingTime ||
                                  "Not available"}
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Shipped Step */}
                        {trackingData.shippingBy && (
                          <div className="relative pl-12">
                            <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-brand-teal-base transform -translate-x-1/2"></div>
                            <div className="p-4 rounded-lg bg-brand-teal-50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-brand-teal-base">
                                  Shipped
                                </h4>
                                <FiCheckCircle className="text-brand-teal-base" />
                              </div>
                              <p className="text-brand-gray-base mb-1">
                                Your order has been shipped
                              </p>
                              <p className="text-sm text-brand-gray-base">
                                <FiClock className="inline mr-1" />
                                {trackingData.shippingBy.shippingTime ||
                                  "Not available"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Delivered Step - only if delivered */}
                        {trackingData.status === "delivered" &&
                          trackingData.deliveredBy && (
                            <div className="relative pl-12">
                              <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-brand-teal-base transform -translate-x-1/2"></div>
                              <div className="p-4 rounded-lg bg-brand-teal-50">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-brand-teal-base">
                                    Delivered
                                  </h4>
                                  <FiCheckCircle className="text-brand-teal-base" />
                                </div>
                                <p className="text-brand-gray-base mb-1">
                                  Your order has been delivered
                                </p>
                                <p className="text-sm text-brand-gray-base">
                                  <FiClock className="inline mr-1" />
                                  {trackingData.deliveredBy.deliveredTime ||
                                    "Not available"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Cancel Step - only if Cancel */}
                        {trackingData.status === "cancel" &&
                          trackingData.cancelBy && (
                            <div className="relative pl-12">
                              <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-red-500 transform -translate-x-1/2"></div>
                              <div className="p-4 rounded-lg bg-red-100">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-red-600">
                                    Cancel
                                  </h4>
                                  <FiCheckCircle className="text-red-600" />
                                </div>
                                <p className="text-brand-gray-base mb-1">
                                  Your order has been cancel
                                </p>
                                <p className="text-sm text-brand-gray-base">
                                  <FiClock className="inline mr-1" />
                                  {trackingData.cancelBy.cancelledTime ||
                                    "Not available"}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {trackingData.user && (
                    <div className="bg-white border border-brand-gray-light rounded-xl p-6 mb-8">
                      <h3 className="text-xl font-semibold text-brand-gray-base mb-4 flex items-center">
                        <FiMapPin className="mr-2 text-brand-teal-base" />
                        Delivery Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-brand-gray-base mb-1">
                            Shipping To
                          </h4>
                          <p className="text-brand-gray-base">
                            {trackingData.user.address || "Not provided"}
                            <br />
                            {trackingData.user.district || ""}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-brand-gray-base mb-1">
                            Contact
                          </h4>
                          <p className="text-brand-gray-base">
                            {trackingData.user.name || "Not provided"}
                            <br />
                            {trackingData.user.mobile || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  {trackingData.items && trackingData.items.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-brand-gray-base mb-4">
                        Order Items
                      </h3>
                      <div className="border border-brand-gray-light rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-brand-gray-light">
                          <thead className="bg-brand-gray-light">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray-base uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray-base uppercase tracking-wider">
                                SKU
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray-base uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray-base uppercase tracking-wider">
                                Qty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray-base uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-brand-gray-light">
                            {trackingData.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        item.image ||
                                        "https://via.placeholder.com/60"
                                      }
                                      alt={item.name || "Product"}
                                      className="w-10 h-10 object-cover rounded"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://via.placeholder.com/60";
                                      }}
                                    />
                                    <div>
                                      <p className="font-medium text-brand-gray-base">
                                        {item.name || "Unnamed Product"}
                                      </p>
                                      {item.variant?.weight && (
                                        <p className="text-xs text-brand-gray-base">
                                          {item.variant.weight}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-brand-gray-base">
                                  {item.sku || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-brand-gray-base">
                                  {item.variant?.price || item.price || "0"} BDT
                                </td>
                                <td className="px-4 py-3 text-brand-gray-base">
                                  {item.quantity || "1"}
                                </td>
                                <td className="px-4 py-3 font-medium text-brand-gray-base">
                                  {(
                                    (item.variant?.price || item.price || 0) *
                                    (item.quantity || 1)
                                  ).toFixed(2)}{" "}
                                  BDT
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-brand-cream p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-brand-teal-base mb-4">
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-brand-gray-base">Subtotal:</span>
                        <span className="font-medium">
                          {trackingData.subtotal || "0"} BDT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray-base">Shipping:</span>
                        <span className="font-medium">
                          {trackingData.shippingCost || "0"} BDT
                        </span>
                      </div>
                      <div className="pt-3 border-t border-brand-gray-light flex justify-between">
                        <span className="text-brand-gray-base font-semibold">
                          Total:
                        </span>
                        <span className="font-bold text-brand-teal-base">
                          {trackingData.total || "0"} BDT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackOrder;
