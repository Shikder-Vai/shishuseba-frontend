import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiCalendar,
  FiX,
  FiTruck,
} from "react-icons/fi";
import { format, parse } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useOrderRequest from "../../hooks/useOrderRequest";
import { useAuth } from "../../main";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import axios from "axios";
import SectionTitle from "../../components/SectionTitle";

const statusColors = {
  processing: "bg-blue-100 text-blue-600",
  shipped: "bg-purple-100 text-purple-600",
  delivered: "bg-green-100 text-green-600",
  cancel: "bg-red-100 text-red-600",
};

const ProcessingOrder = () => {
  const { user } = useAuth();
  const [orders, loadingOrder, refetch] = useOrderRequest("processing");
  const axiosPublic = useAxiosPublic();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [bulkCourierNote, setBulkCourierNote] = useState("");
  const [modalCourierNote, setModalCourierNote] = useState("");

  //...inside the ProcessingOrder component

  const filteredOrders =
    orders
      ?.filter((order) => {
        // Step 1: Filter by the selected date
        if (dateFilter === "all") {
          return true;
        }

        const orderDate = new Date(order.processBy?.processingTime);
        const today = new Date();

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
      .filter((order) => {
        // Step 2: Filter the result by your search term
        return order?.user?.mobile?.includes(searchTerm);
      })
      .sort((a, b) => {
        // Step 3: Sort the final list by date
        const timeA = new Date(a.processBy?.processingTime);
        const timeB = new Date(b.processBy?.processingTime);
        return timeB - timeA;
      }) || [];

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

  const formatProcessingTime = () => {
    // Use date-fns formatting used elsewhere: 'dd MMM yyyy, h:mm aa'
    return format(new Date(), "dd MMM yyyy, h:mm aa");
  };

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: async ({ id, newStatus, courierNote }) => {
      const updateData = { status: newStatus };

      if (newStatus === "delivered") {
        updateData.deliveredBy = {
          ...user,
          deliveredTime: new Date().toISOString(),
        };
      } else if (newStatus === "shipped") {
        updateData.shippingBy = {
          ...user,
          shippingTime: new Date().toISOString(),
        };
        // allow optional courier note
        if (typeof courierNote === "string" && courierNote.trim() !== "") {
          updateData.shippingNote = courierNote;
        }
      } else if (newStatus === "approved") {
        updateData.approvedBy = {
          ...user,
          approvedTime: new Date().toISOString(),
        };
      } else if (newStatus === "pending") {
        // include an empty processBy object so backend will run processBy branch and set status
        updateData.processBy = {};
      } else if (newStatus === "cancel") {
        updateData.cancelBy = {
          ...user,
          cancelledTime: new Date().toISOString(),
        };
      }
      console.log(updateData);
      const res = await axiosPublic.patch(`/order-request/${id}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      refetch();
      Swal.fire({
        title: "Status Updated",
        text: "Order status changed successfully",
        icon: "success",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
        backdrop: `rgba(254,239,224,0.4)`,
      });
    },
    onError: () => {
      Swal.fire({
        title: "Error",
        text: "Something went wrong",
        icon: "error",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
      });
    },
  });

  const { mutate: bulkUpdateOrders } = useMutation({
    mutationFn: async ({ newStatus, courierNote }) => {
      const updateTimeIso = new Date().toISOString();

      // First get the selected orders data
      const selectedOrdersData = orders.filter((order) =>
        selectedOrders.includes(order._id)
      );

      // Prepare shipments data for Steadfast API
      const shipments = selectedOrdersData.map((order) => ({
        invoice: order?.orderId,
        recipient_name: order?.user?.name,
        recipient_address: order?.user?.address,
        recipient_phone: order?.user?.mobile,
        district: order?.user?.district,
        cod_amount: order?.total,
        status: "shipping",
        note: order?.admin_note || "N/A",
      }));
      // ---- SteadFast API Start ----
      // First hit Steadfast API
      const steadfastRes = await axios.post(
        "https://portal.packzy.com/api/v1/create_order/bulk-order",
        shipments,
        {
          headers: {
            "Api-Key": `${import.meta.env.VITE_STEADFAST_API_PUBLIC_KEY}`,
            "Secret-Key": `${import.meta.env.VITE_STEADFAST_API_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          withCredentials: false,
        }
      );

      console.log("📦 Steadfast Shipment Response:", steadfastRes.data); //this is for steadFast res checking

      // Check if Steadfast API was successful (status 200)
      if (steadfastRes.status !== 200) {
        throw new Error("Steadfast API request failed");
      }

      const shipmentDataMap = new Map();
      steadfastRes.data.data.forEach((shipment) => {
        shipmentDataMap.set(shipment.invoice, shipment);
      });

      const updates = selectedOrdersData.map((order) => {
        const shipmentDetails = shipmentDataMap.get(order.orderId);
        const payload = {
          status: newStatus,
          shippingBy: { ...user, shippingTime: updateTimeIso },
          consignment_id: shipmentDetails?.consignment_id || null,
          tracking_code: shipmentDetails?.tracking_code || null,
        };

        if (typeof courierNote === "string" && courierNote.trim() !== "") {
          payload.shippingNote = courierNote;
        }

        // Send the update request for this specific order
        return axiosPublic.patch(`/order-request/${order._id}`, payload);
      });

      // ---  ENDS  ---

      return Promise.all(updates);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Success",
        text: "Orders shipped successfully and sent to Steadfast!",
        icon: "success",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
      });
      setSelectedOrders([]);
      setSelectAll(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: error.message.includes("Steadfast")
          ? "Failed to create shipment in Steadfast. Orders were not updated."
          : "Failed to update orders",
        icon: "error",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
      });
    },
  });

  if (loadingOrder) return <Loader />;

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

  const handleSelectAll = () => {
    if (selectAll) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map((o) => o._id));
    setSelectAll(!selectAll);
  };

  const handleCheckbox = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  if (filteredOrders?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Processing Orders
          </h1>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <p className="text-brand-gray-base text-lg font-medium">
              {searchTerm
                ? "No orders match your search"
                : "You have no processing orders!"}
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
      <SectionTitle title="Processing Orders" />

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
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
        {/* Add the filter buttons here */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-brand-gray-light">
          <button
            onClick={() => setDateFilter("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              dateFilter === "all"
                ? "bg-brand-teal-base text-white shadow-soft"
                : "text-brand-gray-base hover:bg-gray-100"
            }`}
          >
            All Orders
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

        {selectedOrders.length > 0 && (
          <motion.div
            className="flex items-center gap-4 bg-brand-cream p-3 rounded-lg shadow-soft"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-brand-gray-base">
              {selectedOrders.length} selected
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Courier note (optional)"
                value={bulkCourierNote}
                onChange={(e) => setBulkCourierNote(e.target.value)}
                className="px-3 py-2 rounded-md border border-brand-gray-light text-sm"
              />
              <button
                onClick={() =>
                  bulkUpdateOrders({
                    newStatus: "shipped",
                    courierNote: bulkCourierNote,
                  })
                }
                className="bg-brand-teal-base hover:bg-brand-teal-300 text-white px-4 py-2 rounded-lg shadow-soft transition-colors flex items-center gap-2"
              >
                <FiCheck />
                Shipment
              </button>
            </div>
            <button
              onClick={() => bulkUpdateOrders({ newStatus: "cancel" })}
              className="bg-brand-orange-base hover:bg-brand-orange-light text-white px-4 py-2 rounded-lg shadow-soft-orange transition-colors flex items-center gap-2"
            >
              <FiX /> Cancel
            </button>
          </motion.div>
        )}
      </div>

      {/* ... rest of the component remains the same ... */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-soft border border-brand-gray-light"
      >
        <div>
          <Table className="min-w-full table-fixed">
            <Thead className="bg-brand-teal-base text-white overflow-hidden sticky top-0 z-10">
              <Tr>
                <Th className="px-3 py-4 text-left w-12 rounded-tl-xl">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded text-brand-teal-400 focus:ring-brand-teal-300 h-4 w-4"
                  />
                </Th>
                <Th className="px-3 py-4 text-left">Order ID</Th>
                <Th className="px-3 py-4 text-left w-32">Customer</Th>
                <Th className="px-3 py-4 text-left hidden md:table-cell">
                  Phone
                </Th>
                <Th className="px-3 py-4 text-left hidden lg:table-cell w-24">
                  Items
                </Th>
                <Th className="px-3 py-4 text-left">Total</Th>
                <Th className="px-3 py-4 text-left hidden sm:table-cell text-sm">
                  Order Date
                </Th>
                <Th className="px-3 py-4 text-left w-32">Status</Th>
                <Th className="px-3 py-4 text-left">Processed</Th>
                <Th className="px-3 py-4 text-left rounded-tr-xl">Actions</Th>
              </Tr>
            </Thead>
            <Tbody className="divide-y divide-brand-gray-light">
              {filteredOrders.map((o) => {
                const isDuplicate = mobileCount[o?.user?.mobile] > 1;
                return (
                  <>
                    <Tr
                      key={o?._id}
                      className="hover:bg-brand-cream/30 transition-colors"
                    >
                      <Td className="px-3 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(o._id)}
                          onChange={() => handleCheckbox(o._id)}
                          className="rounded text-brand-teal-400 focus:ring-brand-teal-300 h-4 w-4"
                        />
                      </Td>
                      <Td className="px-3 py-3">
                        <div className="font-medium text-brand-gray-base">
                          {o?.orderId}
                        </div>
                      </Td>
                      <Td className="px-3 py-3">
                        <div className="font-medium text-brand-gray-base text-sm">
                          {o?.user?.name} <br /> {o?.user?.address}{" "}
                          {o?.user?.district}
                        </div>
                      </Td>
                      <Td
                        className={`px-3 py-3 whitespace-nowrap hidden md:table-cell text-sm ${
                          isDuplicate
                            ? "bg-yellow-50 font-semibold text-brand-orange-base"
                            : "text-brand-gray-base"
                        }`}
                      >
                        {o?.user?.mobile}
                      </Td>
                      <Td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell text-brand-gray-base">
                        {o?.items?.length} item(s)
                      </Td>
                      <Td className="px-3 py-3 whitespace-nowrap font-medium text-brand-gray-base">
                        {o?.total} BDT
                      </Td>
                      <Td className="px-3 py-3 hidden sm:table-cell text-brand-gray-base text-sm">
                        {formatDate(o?.user?.orderDate)}
                      </Td>
                      <Td className="px-3 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[o.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </Td>
                      <Td className="px-3 py-3">
                        <div className="text-brand-gray-base">
                          <p className="font-medium text-xs">
                            {o?.processBy?.name}
                          </p>
                          <p className="text-xs text-brand-orange-base">
                            {formatDate(o?.processBy?.processingTime)}
                          </p>
                        </div>
                      </Td>
                      <Td className="px-3 py-3 whitespace-nowrap">
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
                        <Td colSpan="9" className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium text-brand-gray-base">
                                Phone:
                              </p>
                              <p>{o?.user?.mobile}</p>
                            </div>
                            <div>
                              <p className="font-medium text-brand-gray-base">
                                Date:
                              </p>
                              <p>{formatDate(o?.user?.orderDate)}</p>
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
                                Status:
                              </p>
                              <select
                                className="border border-brand-gray-light px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent mt-1"
                                defaultValue={o?.status}
                                onChange={(e) =>
                                  updateOrderStatus({
                                    id: o?._id,
                                    newStatus: e.target.value,
                                  })
                                }
                              >
                                <option value="processing">Processing</option>
                                <option value="delivered">Delivered</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="cancel">Cancel</option>
                              </select>
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
                    <div className="flex items-center gap-3">
                      <select
                        className="border border-brand-gray-light px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent"
                        defaultValue={selectedOrder?.status}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateOrderStatus({
                            id: selectedOrder?._id,
                            newStatus: val,
                            courierNote:
                              val === "shipped" ? modalCourierNote : undefined,
                          });
                          setShowDetailModal(false);
                        }}
                      >
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="cancel">Cancel</option>
                      </select>
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
                          Order ID:
                        </span>{" "}
                        {selectedOrder?.orderId}
                      </p>
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
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Note:
                        </span>{" "}
                        {selectedOrder.user?.notes || "No notes provided"}
                      </p>
                    </div>
                  </div>

                  {/* Processing Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiCalendar size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Processing Info
                      </h3>
                    </div>
                    <div className="space-y-2 pl-11">
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Processed By:
                        </span>{" "}
                        {selectedOrder.processBy?.name}
                      </p>
                      <p>
                        <span className="font-medium text-brand-gray-base">
                          Processing Time:
                        </span>{" "}
                        {formatDate(selectedOrder.processBy?.processingTime)}
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
                        {formatDate(selectedOrder.approvedBy?.approvedTime)}
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
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-brand-gray-base mb-1 block">
                        Courier Note (optional)
                      </label>
                      <textarea
                        value={modalCourierNote}
                        onChange={(e) => setModalCourierNote(e.target.value)}
                        placeholder="Optional note to include with courier/shipping"
                        className="w-full p-3 rounded border border-brand-gray-light bg-white"
                        rows={3}
                      />
                    </div>
                    {selectedOrder.status === "delivered" &&
                      selectedOrder.deliveredBy && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-brand-gray-base mb-1">
                            Delivery Information
                          </p>
                          <div className="bg-white p-3 rounded border border-brand-gray-light">
                            <p>
                              <span className="font-medium">Delivered By:</span>{" "}
                              {selectedOrder.deliveredBy.name}
                            </p>
                            <p>
                              <span className="font-medium">
                                Delivery Time:
                              </span>{" "}
                              {selectedOrder.deliveredBy.deliveredTime}
                            </p>
                          </div>
                        </div>
                      )}
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

export default ProcessingOrder;
