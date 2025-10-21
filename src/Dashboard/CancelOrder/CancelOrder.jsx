import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiUser,
  FiCalendar,
  FiCheck,
  FiTruck,
  FiX,
} from "react-icons/fi";
import useOrderRequest from "../../hooks/useOrderRequest";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import Loader from "../../components/Loader";
import SectionTitle from "../../components/SectionTitle";
import { format, parse } from "date-fns";

const statusColors = {
  cancel: "bg-red-100 text-red-600",
};

const CancelOrder = () => {
  const [orders, loadingOrder] = useOrderRequest("cancel");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (loadingOrder) return <Loader />;

  const filteredOrders =
    orders?.filter((order) => order?.user?.mobile?.includes(searchTerm)) || [];

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    let parsedDate;

    const isoDate = new Date(dateString);

    if (!isNaN(isoDate)) {
      parsedDate = isoDate;
    } else {
      try {
        const oldFormat = "dd MMMM yyyy 'at' hh:mm a";
        parsedDate = parse(dateString, oldFormat, new Date());
        if (isNaN(parsedDate)) {
          throw new Error("Could not parse old format");
        }
      } catch (error) {
        console.error(
          "Failed to parse date in any known format:",
          dateString,
          error
        );
        return "Invalid Date";
      }
    }

    try {
      const outputFormat = "dd MMM yyyy, h:mm aa";
      return format(parsedDate, outputFormat);
    } catch (error) {
      console.error("Failed to format the parsed date:", parsedDate, error);
      return "Formatting Error";
    }
  };

  if (filteredOrders?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Canceled Orders
          </h1>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <p className="text-brand-gray-base text-lg font-medium">
              {searchTerm
                ? "No orders match your search"
                : "No canceled orders found!"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-brand-teal-base hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  return (
    <div>
      <SectionTitle title="Canceled Orders" />

      <div className="mb-6">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-brand-gray-base" />
          </div>
          <input
            type="text"
            placeholder="Search by phone number..."
            className="block w-full pl-10 pr-3 py-2 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-soft border border-brand-gray-light"
      >
        <div>
          <Table className="min-w-full table-fixed">
            <Thead className="bg-brand-teal-base text-white overflow-hidden sticky top-0 z-10">
              <Tr>
                <Th className="px-6 py-4 text-left rounded-tl-xl">SL</Th>
                <Th className="px-6 py-4 text-left text-sm">Order ID</Th>
                <Th className="px-6 py-4 text-left hidden md:table-cell">
                  Phone
                </Th>
                <Th className="px-6 py-4 text-left hidden lg:table-cell">
                  Items
                </Th>
                <Th className="px-6 py-4 text-left">Total</Th>
                <Th className="px-6 py-4 text-left hidden sm:table-cell text-sm">
                  Order Date
                </Th>
                <Th className="px-6 py-4 text-left">Status</Th>
                <Th className="px-6 py-4 text-left text-sm">Canceled By</Th>
                <Th className="px-6 py-4 text-left rounded-tr-xl">Actions</Th>
              </Tr>
            </Thead>
            <Tbody className="divide-y divide-brand-gray-light">
              {filteredOrders.reverse().map((o, i) => (
                <Tr
                  key={o?._id}
                  className="hover:bg-brand-cream/30 transition-colors"
                >
                  <Td className="px-4 py-3 whitespace-nowrap">{i + 1}</Td>
                  <Td className="px-4 py-3">
                    <div className="font-medium text-brand-gray-base">
                      {o?.orderId}
                    </div>
                    <div className="text-sm text-brand-gray-base md:hidden">
                      {o?.user?.mobile}
                    </div>
                  </Td>
                  <Td className="px-4 py-3 whitespace-nowrap hidden md:table-cell text-brand-gray-base">
                    {o?.user?.mobile}
                  </Td>
                  <Td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell text-brand-gray-base">
                    {o?.items?.length} item(s)
                  </Td>
                  <Td className="px-4 py-3 whitespace-nowrap font-medium text-brand-gray-base">
                    {o?.total} BDT
                  </Td>
                  <Td className="px-4 py-3 hidden sm:table-cell text-brand-gray-base">
                    {formatDate(o?.user?.orderDate)}
                  </Td>
                  <Td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[o.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </Td>
                  <Td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-brand-gray-base">
                      <p className="font-medium">{o?.cancelBy?.name}</p>
                      <p className="text-xs text-brand-orange-base">
                        {o?.cancelBy?.cancelledTime}
                      </p>
                    </div>
                  </Td>
                  <Td className="px-4 py-3 flex items-center justify-center whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(o)}
                        className="p-1.5 rounded-full bg-brand-teal-50 text-brand-teal-base hover:bg-brand-teal-100 transition-colors"
                        aria-label="View details"
                      >
                        <FiEye size={16} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
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
              <div className="sticky top-0 bg-white p-6 border-b border-brand-gray-light flex justify-between items-center">
                <h2 className="text-xl font-semibold text-brand-teal-base">
                  Order {selectedOrder.orderId}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-brand-gray-base hover:text-brand-orange-base"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6">
                {/* Order Status Bar */}
                <div className="mb-6 p-4 rounded-lg bg-brand-cream">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-brand-gray-base">
                        Order Status
                      </p>
                      <p
                        className={`text-lg font-medium ${
                          statusColors[selectedOrder.status]
                        }`}
                      >
                        {selectedOrder.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Customer Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiUser size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Customer Information
                      </h3>
                    </div>
                    <div className="space-y-2 pl-11">
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Name:
                        </span>{" "}
                        {selectedOrder.user?.name}
                      </p>
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Phone:
                        </span>{" "}
                        {selectedOrder.user?.mobile}
                      </p>
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Address:
                        </span>{" "}
                        {selectedOrder.user?.address},{" "}
                        {selectedOrder.user?.district}
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiX size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Cancellation Info
                      </h3>
                    </div>
                    <div className="space-y-2 pl-11">
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Canceled By:
                        </span>{" "}
                        {selectedOrder.cancelBy?.name}
                      </p>
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Canceled Time:
                        </span>{" "}
                        {selectedOrder.cancelBy?.cancelledTime}
                      </p>
                    </div>
                  </div>

                  {/* Approval Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiCheck size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Approval Info
                      </h3>
                    </div>
                    <div className="space-y-2 pl-11">
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Approved By:
                        </span>{" "}
                        {selectedOrder.approvedBy?.name}
                      </p>
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Approval Time:
                        </span>{" "}
                        {selectedOrder.approvedBy?.approvedTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipment Information */}
                <div className="mb-6 bg-brand-cream/30 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-brand-teal-base mb-3 flex items-center gap-2">
                    <FiTruck size={20} />
                    Shipment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-brand-gray-base mb-1">
                        Shipping Cost
                      </p>
                      <p className="bg-white p-3 rounded border border-brand-gray-light">
                        {selectedOrder.shippingCost} BDT
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-gray-base mb-1">
                        Delivery Address
                      </p>
                      <p className="bg-white p-3 rounded border border-brand-gray-light">
                        {selectedOrder.user?.address},{" "}
                        {selectedOrder.user?.district}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-brand-teal-base mb-3">
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
                        {selectedOrder.items?.map((item) => (
                          <tr key={item._id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/40";
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-brand-gray-base">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-brand-gray-base">
                                    {item.weight}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-brand-gray-base">
                              {item.sku}
                            </td>
                            <td className="px-4 py-3 text-brand-gray-base">
                              {item.price} BDT
                            </td>
                            <td className="px-4 py-3 text-brand-gray-base">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 font-medium text-brand-gray-base">
                              {item.price * item.quantity} BDT
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-brand-cream p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-brand-gray-base">Subtotal:</span>
                      <span className="font-medium">
                        {selectedOrder.subtotal} BDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray-base">Shipping:</span>
                      <span className="font-medium">
                        {selectedOrder.shippingCost} BDT
                      </span>
                    </div>
                    <div className="pt-3 border-t border-brand-gray-light flex justify-between">
                      <span className="text-brand-gray-base font-semibold">
                        Total:
                      </span>
                      <span className="font-bold text-brand-teal-base">
                        {selectedOrder.total} BDT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedOrder.admin_note && (
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      Admin Notes
                    </h3>
                    <p className="text-yellow-700">
                      {selectedOrder.admin_note}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CancelOrder;
