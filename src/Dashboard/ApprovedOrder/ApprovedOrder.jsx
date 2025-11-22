import { useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiEdit2,
  FiUser,
  FiTruck,
  FiDollarSign,
  FiPackage,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useOrderRequest from "../../hooks/useOrderRequest";
import { useAuth } from "../../main";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";
import SectionTitle from "../../components/SectionTitle";
import useProduct from "../../hooks/useProducts";
import { format } from "date-fns";

const statusColors = {
  approved: "bg-brand-teal-50 text-brand-teal-base",
  processing: "bg-blue-100 text-blue-600",
  delivered: "bg-green-100 text-green-600",
  cancel: "bg-red-100 text-red-600",
};

const ApprovedOrder = () => {
  const { products, loadingProduct } = useProduct();
  const { user } = useAuth();
  const [orders, loadingOrder, refetch] = useOrderRequest("approved");
  const axiosPublic = useAxiosPublic();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [showProductSearchModal, setShowProductSearchModal] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!products) {
      return [];
    }
    if (!productSearchTerm) {
      return products;
    }
    return products.filter((product) => {
      const productName =
        typeof product.name === "string"
          ? product.name
          : product.name.en || product.name.bn;
      return (
        productName.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
    });
  }, [products, productSearchTerm]);

  const selectProductVariant = (product, variant) => {
    const newItem = {
      ...product,
      _id: product._id + variant.weight,
      weight: variant.weight,
      price: parseFloat(variant.price),
      variant: variant,
      quantity: 1,
      name:
        typeof product.name === "string"
          ? { en: product.name, bn: product.name }
          : product.name,
    };

    // Remove unnecessary fields
    delete newItem.variants;

    setEditedOrder({
      ...editedOrder,
      items: [...editedOrder.items, newItem],
      subtotal: editedOrder.subtotal + parseFloat(variant.price),
      total:
        editedOrder.subtotal +
        parseFloat(variant.price) +
        (editedOrder.shippingCost || 0),
    });

    setShowProductSearchModal(false);
  };

  const formatProcessingTime = () => {
    return format(new Date(), "dd MMM yyyy, h:mm aa");
  };

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const updateData = { status: newStatus };

      if (newStatus === "processing") {
        updateData.processBy = {
          ...user,
          processingTime: formatProcessingTime(),
        };
      } else if (newStatus === "pending") {
        // backend expects approvedBy/processBy/etc to be present to perform updates
        // set approvedBy to an empty object so the controller will $set status and approvedBy
        updateData.approvedBy = {};
      } else if (newStatus === "cancel") {
        updateData.cancelBy = {
          ...user,
          cancelledTime: formatProcessingTime(),
        };
      }

      const res = await axiosPublic.patch(`/order-request/${id}`, updateData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      refetch();
      Swal.fire({
        title: "Status Updated",
        text: `Order status changed to ${variables.newStatus}`,
        icon: "success",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
        backdrop: `
          rgba(254,239,224,0.4)
        `,
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
    mutationFn: async () => {
      const processingTime = formatProcessingTime();
      const updates = selectedOrders.map((id) =>
        axiosPublic.patch(`/order-request/${id}`, {
          status: "processing",
          processBy: { ...user, processingTime },
        })
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Success",
        text: "Selected orders marked as processing",
        icon: "success",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
      });
      setSelectedOrders([]);
      setSelectAll(false);
      refetch();
    },
    onError: () => {
      Swal.fire({
        title: "Error",
        text: "Bulk update failed",
        icon: "error",
        confirmButtonColor: "#018b76",
        background: "#ffffff",
      });
    },
  });

  const { mutate: updateOrder } = useMutation({
    mutationFn: async (updatedOrder) => {
      const res = await axiosPublic.patch(
        `/update-full-order/${updatedOrder._id}`,
        updatedOrder
      );
      return res.data;
    },
    onSuccess: () => {
      refetch();
      setShowEditModal(false);
      Swal.fire("Updated!", "Order has been updated.", "success");
    },
    onError: () => {
      Swal.fire("Error", "Failed to update order", "error");
    },
  });

  const { mutate: saveAdminNote } = useMutation({
    mutationFn: async ({ id, admin_note }) => {
      const res = await axiosPublic.patch(`/order-request/${id}`, {
        admin_note,
      });
      return res.data;
    },
    onSuccess: () => {
      setShowNoteModal(false);
      setNoteText("");
      setActiveOrderId(null);
      refetch();
      Swal.fire("Saved!", "Note added", "success");
    },
    onError: () => {
      Swal.fire("Error", "Could not save note", "error");
    },
  });

  if (loadingOrder) return <Loader />;

  const filteredOrders =
    orders
      ?.filter((order) => {
        // Step 1: Filter by the selected date
        if (dateFilter === "all") {
          return true;
        }

        const orderDate = new Date(order.approvedBy?.approvedTime);
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
        const timeA = new Date(a.approvedBy?.approvedTime);
        const timeB = new Date(b.approvedBy?.approvedTime);
        return timeB - timeA;
      }) || [];

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

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditedOrder(JSON.parse(JSON.stringify(order))); // Deep clone the order
    setShowEditModal(true);
  };

  const openProductSearch = () => {
    setShowProductSearchModal(true);
    setProductSearchTerm("");
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map((o) => o._id));
    setSelectAll(!selectAll);
  };

  const handleCheckbox = (orderId) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId)
        : [...prevSelected, orderId]
    );
  };
  const handleEditChange = (e, field, isItem = false, itemIndex = null) => {
    const { name, value } = e.target;

    if (isItem && itemIndex !== null) {
      const updatedItems = [...editedOrder.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [name]: name === "price" || name === "quantity" ? Number(value) : value,
      };

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      setEditedOrder({
        ...editedOrder,
        items: updatedItems,
        subtotal: subtotal,
        total: subtotal + (editedOrder.shippingCost || 0),
      });
    } else if (field === "user") {
      setEditedOrder({
        ...editedOrder,
        user: {
          ...editedOrder.user,
          [name]: value,
        },
      });
    } else {
      setEditedOrder({
        ...editedOrder,
        [name]: name === "shippingCost" ? Number(value) : value,
        total:
          name === "shippingCost"
            ? editedOrder.subtotal + Number(value)
            : editedOrder.total,
      });
    }
  };

  const handleSubmitEdit = () => {
    updateOrder(editedOrder);
  };

  const removeItem = (index) => {
    const updatedItems = [...editedOrder.items];
    updatedItems.splice(index, 1);

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      subtotal: subtotal,
      total: subtotal + (editedOrder.shippingCost || 0),
    });
  };

  if (filteredOrders?.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Approved Orders
          </h1>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <p className="text-brand-gray-base text-lg font-medium">
              {searchTerm
                ? "No orders match your search"
                : "You have no approved orders!"}
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
      <SectionTitle title="Approved Orders" />

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
            <button
              onClick={() => bulkUpdateOrders()}
              className="bg-brand-orange-base hover:bg-brand-orange-light text-white px-4 py-2 rounded-lg shadow-soft-orange transition-colors flex items-center gap-2"
            >
              <FiCheck /> Mark as Processing
            </button>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-soft border border-brand-gray-light"
      >
        <div>
          <Table className="min-w-full table-fixed">
            <Thead className="bg-brand-teal-base overflow-hidden text-white sticky top-0 z-10">
              <Tr>
                <Th className="px-4 w-2 py-4 text-left rounded-tl-xl">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded text-brand-teal-400 focus:ring-brand-teal-300"
                  />
                </Th>
                <Th className="px-4 py-4 text-left">Order ID</Th>
                <Th className="px-4 py-4 text-left">Customer</Th>
                <Th className="px-4 py-4 text-left hidden md:table-cell">
                  Phone
                </Th>
                <Th className="px-4 py-4 text-left hidden lg:table-cell">
                  Items
                </Th>
                <Th className="px-4 py-4 text-left">Total</Th>
                <Th className="px-4 py-4 text-left">Status</Th>
                <Th className="px-4 py-4 text-left text-sm">Approved By</Th>
                <Th className="px-4 py-4 text-left rounded-tr-xl">Actions</Th>
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
                      <Td className="px-2 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(o._id)}
                          onChange={() => handleCheckbox(o._id)}
                          className="rounded text-brand-teal-400 focus:ring-brand-teal-300"
                        />
                      </Td>
                      <Td className="px-2 py-3">
                        <div className="font-medium text-brand-gray-base">
                          {o?.orderId}
                        </div>
                      </Td>
                      <Td className="px-2 py-3">
                        <div
                          title={`${o?.user?.name}, ${o?.user?.address}, ${o?.user?.district}`}
                          className="font-medium text-sm text-brand-gray-base overflow-hidden text-ellipsis"
                        >
                          {o?.user?.name}, {o?.user?.address},
                          {o?.user?.district}
                        </div>
                      </Td>
                      <Td
                        className={`px-2 py-3 whitespace-nowrap hidden md:table-cell ${
                          isDuplicate
                            ? "bg-yellow-50 font-semibold text-brand-orange-base"
                            : "text-brand-gray-base"
                        }`}
                      >
                        {o?.user?.mobile}
                      </Td>
                      <Td className="px-2 py-3 whitespace-nowrap hidden lg:table-cell text-brand-gray-base">
                        {o?.items?.length} item(s)
                      </Td>
                      <Td className="px-2 py-3 whitespace-nowrap font-medium text-brand-gray-base">
                        {o?.total} BDT
                      </Td>
                      <Td className="px-2 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[o.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {o.status}
                        </span>
                      </Td>
                      <Td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-brand-gray-base">
                          <p className="font-medium">{o?.approvedBy?.name}</p>
                          <p className="text-xs text-brand-orange-base">
                            {o?.approvedBy?.approvedTime}
                          </p>
                        </div>
                      </Td>
                      <Td className="px-2 flex items-center justify-center py-3 whitespace-nowrap">
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
                                Shipping:
                              </p>
                              <p>
                                {o?.user?.district}, {o?.user?.address}
                              </p>
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
                                <option value="approved">Approved</option>
                                <option value="processing">Processing</option>
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
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditModal(selectedOrder);
                    }}
                    className="flex items-center gap-2 text-brand-orange-base hover:text-brand-orange-light"
                  >
                    <FiEdit2 size={18} /> Edit Order
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-brand-gray-base hover:text-brand-orange-base"
                  >
                    <FiX size={24} />
                  </button>
                </div>
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
                          updateOrderStatus({
                            id: selectedOrder?._id,
                            newStatus: e.target.value,
                          });
                          setShowDetailModal(false);
                        }}
                      >
                        <option value="approved">Approved</option>
                        <option value="processing">Processing</option>
                        <option value="pending">Pending</option>
                        <option value="cancel">Cancel</option>
                      </select>
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
                          Note:
                        </span>{" "}
                        {selectedOrder.user?.notes}
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

                  {/* Approval Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                      Approval Information
                    </h3>
                    <div className="space-y-2">
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
                                    {item.name.en}
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
                {selectedOrder.admin_note && (
                  <div className="bg-brand-cream p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-brand-teal-base mb-3">
                      Admin Note
                    </h3>
                    <p className="text-brand-gray-base">
                      {selectedOrder.admin_note}
                    </p>
                  </div>
                )}
                {/* Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Admin Notes
                      </h3>
                      <button
                        onClick={() => {
                          setActiveOrderId(selectedOrder._id);
                          setNoteText(selectedOrder.admin_note || "");
                          setShowNoteModal(true);
                          setShowDetailModal(false);
                        }}
                        className="text-brand-teal-base hover:underline flex items-center gap-1 text-sm"
                      >
                        <FiEdit2 size={14} />{" "}
                        {selectedOrder.admin_note ? "Edit Note" : "Add Note"}
                      </button>
                    </div>
                    <div className="bg-brand-gray-light/30 p-4 rounded-lg h-full">
                      {selectedOrder.admin_note ? (
                        <p className="text-brand-gray-base">
                          {selectedOrder.admin_note}
                        </p>
                      ) : (
                        <p className="text-brand-gray-base italic">
                          No notes added
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-brand-teal-base">
                  Add Admin Note
                </h2>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-brand-gray-base hover:text-brand-orange-base"
                >
                  <FiX size={20} />
                </button>
              </div>
              <textarea
                rows="4"
                className="w-full border border-brand-gray-light rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent"
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteText("");
                    setActiveOrderId(null);
                  }}
                  className="px-4 py-2 bg-brand-gray-light hover:bg-brand-gray-base text-brand-gray-base rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    saveAdminNote({ id: activeOrderId, admin_note: noteText })
                  }
                  className="px-4 py-2 bg-brand-teal-base hover:bg-brand-teal-300 text-white rounded-lg transition-colors"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Order Modal */}
      <AnimatePresence>
        {showEditModal && editedOrder && (
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
                  Edit Order {editedOrder.orderId}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-brand-gray-base hover:text-brand-orange-base"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6">
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
                    <div className="space-y-3 pl-11">
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editedOrder.user?.name || ""}
                          onChange={(e) => handleEditChange(e, "user")}
                          className="w-full border border-brand-gray-light rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="mobile"
                          value={editedOrder.user?.mobile || ""}
                          onChange={(e) => handleEditChange(e, "user")}
                          className="w-full border border-brand-gray-light rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Notes
                        </label>
                        <input
                          type="text"
                          name="notes"
                          value={editedOrder.user?.notes || ""}
                          onChange={(e) => handleEditChange(e, "user")}
                          className="w-full border border-brand-gray-light rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiTruck size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Shipping Information
                      </h3>
                    </div>
                    <div className="space-y-3 pl-11">
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editedOrder.user?.address || ""}
                          onChange={(e) => handleEditChange(e, "user")}
                          className="w-full border border-brand-gray-light rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          District
                        </label>
                        <input
                          type="text"
                          name="district"
                          value={editedOrder.user?.district || ""}
                          onChange={(e) => handleEditChange(e, "user")}
                          className="w-full border border-brand-gray-light rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-brand-cream/30 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiDollarSign size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Order Summary
                      </h3>
                    </div>
                    <div className="space-y-3 pl-11">
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Subtotal
                        </label>
                        <input
                          type="number"
                          value={editedOrder.subtotal || 0}
                          readOnly
                          className="w-full border border-brand-gray-light rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Shipping Cost
                        </label>
                        <input
                          type="number"
                          name="shippingCost"
                          value={editedOrder.shippingCost || 0}
                          onChange={handleEditChange}
                          className="w-full border border-brand-gray-light rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-gray-base mb-1">
                          Total
                        </label>
                        <input
                          type="number"
                          value={editedOrder.total || 0}
                          readOnly
                          className="w-full border border-brand-gray-light rounded-lg p-2 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-brand-teal-100 text-brand-teal-base">
                        <FiPackage size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-brand-teal-base">
                        Order Items
                      </h3>
                    </div>
                    <button
                      onClick={openProductSearch}
                      className="flex items-center gap-1 text-brand-teal-base hover:text-brand-teal-300"
                    >
                      <FiPlus size={16} /> Add Product
                    </button>
                  </div>
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-brand-gray-base uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-brand-gray-light">
                        {editedOrder.items?.map((item, index) => (
                          <tr key={item._id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name.en}
                                  className="w-10 h-10 object-cover rounded"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://via.placeholder.com/40";
                                  }}
                                />
                                <div>
                                  <p className="font-medium text-brand-gray-base">
                                    {item.name.en}
                                  </p>
                                  <p className="text-xs text-brand-gray-base">
                                    {item.weight}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                name="sku"
                                value={item.variant.sku}
                                onChange={(e) =>
                                  handleEditChange(e, null, true, index)
                                }
                                className="w-full border border-brand-gray-light rounded p-1 focus:outline-none focus:ring-1 focus:ring-brand-teal-300"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                name="price"
                                value={item.price}
                                onChange={(e) =>
                                  handleEditChange(e, null, true, index)
                                }
                                className="w-full border border-brand-gray-light rounded p-1 focus:outline-none focus:ring-1 focus:ring-brand-teal-300"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                name="quantity"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleEditChange(e, null, true, index)
                                }
                                className="w-full border border-brand-gray-light rounded p-1 focus:outline-none focus:ring-1 focus:ring-brand-teal-300"
                              />
                            </td>
                            <td className="px-4 py-3 font-medium text-brand-gray-base">
                              {item.price * item.quantity} BDT
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-brand-gray-light rounded-lg text-brand-gray-base hover:bg-brand-gray-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitEdit}
                    className="px-6 py-2 bg-brand-teal-base text-white rounded-lg hover:bg-brand-teal-300 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Search Modal */}
      <AnimatePresence>
        {showProductSearchModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="sticky top-0 bg-white p-6 border-b border-brand-gray-light flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold text-brand-teal-base">
                  Search Products
                </h2>
                <button
                  onClick={() => setShowProductSearchModal(false)}
                  className="text-brand-gray-base hover:text-brand-orange-base"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-brand-gray-base" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    className="block w-full pl-10 pr-3 py-2 border border-brand-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredProducts.map(
                    (product) => (
                      console.log(product),
                      (
                        <div
                          key={product._id}
                          className="border border-brand-gray-light rounded-lg p-4"
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/64";
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-brand-gray-base">
                                {product.name.en || product.name}
                              </h3>
                              <p className="text-sm text-brand-gray-base">
                                {product.variants.map((variant, index) => (
                                  <span key={index}>{variant.sku}, </span>
                                ))}
                              </p>
                              <div className="mt-2">
                                <h4 className="text-sm font-medium text-brand-gray-base mb-1">
                                  Variants:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {product.variants.map((variant, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() =>
                                        selectProductVariant(product, variant)
                                      }
                                      className="px-3 py-1 text-sm border border-brand-teal-300 text-brand-teal-base rounded-full hover:bg-brand-teal-50 transition-colors"
                                    >
                                      {variant.weight} - {variant.price} BDT
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-brand-teal-base">
                  Add Admin Note
                </h2>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-brand-gray-base hover:text-brand-orange-base"
                >
                  <FiX size={20} />
                </button>
              </div>
              <textarea
                rows="4"
                className="w-full border border-brand-gray-light rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-teal-300 focus:border-transparent"
                placeholder="Write your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setNoteText("");
                    setActiveOrderId(null);
                  }}
                  className="px-4 py-2 bg-brand-gray-light hover:bg-brand-gray-base text-brand-gray-base rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    saveAdminNote({ id: activeOrderId, admin_note: noteText })
                  }
                  className="px-4 py-2 bg-brand-teal-base hover:bg-brand-teal-300 text-white rounded-lg transition-colors"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApprovedOrder;
