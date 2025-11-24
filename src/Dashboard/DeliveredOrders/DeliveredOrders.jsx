import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import Loader from "../../components/Loader";
import SectionTitle from "../../components/SectionTitle";
import useOrderRequest from "../../hooks/useOrderRequest";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import { parse } from "date-fns";

const statusColors = {
  delivered: "bg-green-100 text-green-600",
  cancel: "bg-red-100 text-red-600",
};

const DeliveredOrders = () => {
  const [orders, loadingOrder] = useOrderRequest("delivered");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (loadingOrder) return <Loader />;

  // Parse various date formats into a Date object (ISO or legacy formats)
  const parseToDate = (dateString) => {
    if (!dateString) return null;

    const isoDate = new Date(dateString);
    if (!isNaN(isoDate)) return isoDate;

    try {
      const oldFormat = "dd MMMM yyyy 'at' hh:mm a";
      const parsed = parse(dateString, oldFormat, new Date());
      if (!isNaN(parsed)) return parsed;
    } catch {
      // fallthrough
    }

    try {
      const altFormat = "dd MMM yyyy, h:mm aa";
      const parsedAlt = parse(dateString, altFormat, new Date());
      if (!isNaN(parsedAlt)) return parsedAlt;
    } catch {
      // fallthrough
    }

    return null;
  };

  const filteredOrders =
    orders
      ?.filter((order) => {
        if (dateFilter === "all") return true;

        // Prefer the delivered timestamp for delivered orders; fall back to orderDate
        const rawDate =
          order?.deliveredBy?.deliveredTime || order?.user?.orderDate;
        const orderDate = parseToDate(rawDate) || new Date(rawDate);
        const today = new Date();

        if (!orderDate || isNaN(orderDate)) return false;

        if (dateFilter === "today") {
          return (
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          );
        }

        if (dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          return (
            orderDate.getDate() === yesterday.getDate() &&
            orderDate.getMonth() === yesterday.getMonth() &&
            orderDate.getFullYear() === yesterday.getFullYear()
          );
        }

        return true;
      })
      .filter((order) => order?.user?.mobile?.includes(searchTerm)) || [];

  const mobileCount = {};
  orders?.forEach((o) => {
    const phone = o?.user?.mobile;
    if (phone) mobileCount[phone] = (mobileCount[phone] || 0) + 1;
  });

  const toggleRowExpand = (orderId) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (filteredOrders?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Delivered Orders
          </h1>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <p className="text-brand-gray-base text-lg font-medium">
              {searchTerm
                ? "No orders match your search"
                : "No delivered orders found!"}
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

  return (
    <div>
      <SectionTitle title="Delivered Orders" />

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
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-brand-gray-light mt-3 md:mt-0">
          <button
            onClick={() => setDateFilter("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "all"
                ? "bg-brand-teal-base text-white shadow-soft"
                : "text-brand-gray-base hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDateFilter("today")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "today"
                ? "bg-brand-teal-base text-white shadow-soft"
                : "text-brand-gray-base hover:bg-gray-100"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter("yesterday")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "yesterday"
                ? "bg-brand-teal-base text-white shadow-soft"
                : "text-brand-gray-base hover:bg-gray-100"
            }`}
          >
            Yesterday
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-soft border border-brand-gray-light"
      >
        <div>
          <Table className="min-w-full">
            <Thead className="bg-brand-teal-base text-white overflow-hidden sticky top-0 z-10">
              <Tr>
                <Th className="px-6 py-4 text-left rounded-tl-xl text-sm">
                  Order ID
                </Th>
                <Th className="px-6 py-4 text-left">Customer</Th>
                <Th className="px-6 py-4 text-left hidden md:table-cell">
                  Phone
                </Th>
                <Th className="px-6 py-4 text-left hidden lg:table-cell">
                  Items
                </Th>
                <Th className="px-6 py-4 text-left">Total</Th>
                <Th className="px-6 py-4 text-left hidden sm:table-cell">
                  Date
                </Th>
                <Th className="px-6 py-4 text-left">Status</Th>
                <Th className="px-6 py-4 text-left rounded-tr-xl">Actions</Th>
              </Tr>
            </Thead>
            <Tbody className="divide-y divide-brand-gray-light">
              {filteredOrders.reverse().map((o) => {
                const isDuplicate = mobileCount[o?.user?.mobile] > 1;
                return (
                  <>
                    <Tr
                      key={o?._id}
                      className="hover:bg-brand-cream/30 transition-colors"
                    >
                      <Td className="px-4 py-3">
                        <div className="font-medium text-brand-gray-base">
                          {o?.orderId}
                        </div>
                      </Td>
                      <Td className="px-4 py-3">
                        <div className="font-medium text-brand-gray-base">
                          {o?.user?.name} <br /> {o?.user?.address}{" "}
                          {o?.user?.district}
                        </div>
                      </Td>
                      <Td
                        className={`px-4 py-3 whitespace-nowrap hidden md:table-cell ${
                          isDuplicate
                            ? "bg-yellow-50 font-semibold text-brand-orange-base"
                            : "text-brand-gray-base"
                        }`}
                      >
                        {o?.user?.mobile}
                      </Td>
                      <Td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell text-brand-gray-base">
                        {o?.items?.length} item(s)
                      </Td>
                      <Td className="px-4 py-3 whitespace-nowrap font-medium text-brand-gray-base">
                        {o?.total} BDT
                      </Td>
                      <Td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell text-brand-gray-base">
                        {o?.user?.orderDate}
                      </Td>
                      <Td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[o.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </Td>
                      <Td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailModal(o)}
                            className="p-1.5 rounded-full bg-brand-teal-50 text-brand-teal-base hover:bg-brand-teal-100 transition-colors"
                            aria-label="View details"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => toggleRowExpand(o._id)}
                            className="p-1.5 rounded-full bg-brand-gray-light text-brand-gray-base hover:bg-brand-gray-base hover:text-white md:hidden transition-colors"
                            aria-label="Expand row"
                          >
                            {expandedRow === o._id ? (
                              <FiChevronUp size={16} />
                            ) : (
                              <FiChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </Td>
                    </Tr>

                    {/* Expanded row for mobile */}
                    {expandedRow === o._id && (
                      <Tr className="md:hidden bg-brand-cream/20">
                        <Td colSpan="7" className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium text-brand-gray-base">
                                Phone:
                              </p>
                              <p
                                className={
                                  isDuplicate
                                    ? "text-brand-orange-base font-medium"
                                    : ""
                                }
                              >
                                {o?.user?.mobile}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-brand-gray-base">
                                Date:
                              </p>
                              <p>{o?.user?.orderDate}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="font-medium text-brand-gray-base">
                                Items:
                              </p>
                              <ul className="list-disc pl-5">
                                {o?.items?.map((item) => (
                                  <li
                                    key={item?._id}
                                    className="text-brand-gray-base"
                                  >
                                    {item?.sku} - {item?.quantity} ×{" "}
                                    {item?.price} BDT
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="col-span-2">
                              <p className="font-medium text-brand-gray-base">
                                Shipping:
                              </p>
                              <p>
                                {o?.user?.district}, {o?.user?.address}
                              </p>
                            </div>
                          </div>
                        </Td>
                      </Tr>
                    )}
                  </>
                );
              })}
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
                    <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                      Customer Information
                    </h3>
                    <div className="space-y-2">
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
                          Notes:
                        </span>{" "}
                        {selectedOrder.user?.notes || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                      Shipping Information
                    </h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Address:
                        </span>{" "}
                        {selectedOrder.user?.address}
                      </p>
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          District:
                        </span>{" "}
                        {selectedOrder.user?.district}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                      Delivery Information
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.deliveredBy && (
                        <>
                          <p>
                            <span className="font-medium text-brand-gray-base">
                              Delivered By:
                            </span>{" "}
                            {selectedOrder.deliveredBy.name}
                          </p>
                          <p>
                            <span className="font-medium text-brand-gray-base">
                              Delivery Time:
                            </span>{" "}
                            {selectedOrder.deliveredBy.deliveredTime}
                          </p>
                        </>
                      )}
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
                <div className="bg-brand-cream p-4 rounded-lg mt-4">
                  <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                    Admin Notes
                  </h3>
                  {selectedOrder?.admin_note && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {selectedOrder.admin_note}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeliveredOrders;
