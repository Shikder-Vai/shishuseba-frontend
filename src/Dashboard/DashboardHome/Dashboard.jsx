import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertCircle,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiUsers,
  FiPieChart,
  FiBarChart2,
  FiAward,
  FiCalendar,
  FiMapPin,
  FiArchive,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  DatePicker,
  Select,
  Card,
  Spin,
  Table,
  Row,
  Col,
  Statistic,
} from "antd";
import moment from "moment";
import useOrderReports from "./../../hooks/useOrderReports";
import useAllProducts from "./../../hooks/useAllProducts";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Brand color palette
const COLORS = [
  "#018b76", // Brand teal base
  "#ffa245", // Brand orange
  "#179784", // Accent teal
  "#6c6c6c", // Neutral gray
  "#b5dcd6", // Light teal
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const OrderAnalyticsDashboard = () => {
  const { reports, loading, error, filters, updateFilters } = useOrderReports();
  const [products] = useAllProducts();

  const totalStockValue =
    products?.reduce((acc, product) => {
      if (product.variants && product.variants.length > 0) {
        return (
          acc +
          product.variants.reduce((variantAcc, variant) => {
            const stock = variant.stock_quantity || 0;
            const price = variant.price || 0;
            return variantAcc + stock * price;
          }, 0)
        );
      }
      return acc;
    }, 0) || 0;

  const handleDateChange = (dates) => {
    updateFilters({
      startDate: dates?.[0]?.toDate(),
      endDate: dates?.[1]?.toDate(),
    });
  };

  const handleDistrictChange = (district) => {
    updateFilters({ district });
  };

  if (loading.districts) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#feefe0] to-white">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-brand-teal-base"
        >
          <FiTrendingUp size={48} className="text-[#018b76]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] p-4 md:p-8">
      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="toast toast-top toast-end z-50"
          >
            <div className="alert alert-error shadow-lg">
              <div>
                <FiAlertCircle className="text-xl" />
                <div>
                  <h3 className="font-bold">Error Loading Data</h3>
                  <div className="text-xs">{error}</div>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#018b76] to-[#259e8b] rounded-xl shadow-md p-6 mb-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Order Analytics Dashboard
            </h1>
            <p className="opacity-90">
              Comprehensive overview of your business performance
            </p>
          </div>
          <FiTrendingUp className="w-12 h-12 opacity-80" />
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="card bg-white shadow-md mb-8 border border-[#b5dcd6]"
      >
        <div className="card-body">
          <h2 className="card-title text-[#018b76]">
            <FiCalendar className="mr-2" />
            Analytics Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-[#6c6c6c]">Date Range</span>
              </label>
              <RangePicker
                className="w-full"
                onChange={handleDateChange}
                value={[
                  filters.startDate ? moment(filters.startDate) : null,
                  filters.endDate ? moment(filters.endDate) : null,
                ]}
                disabledDate={(current) =>
                  current && current > moment().endOf("day")
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text text-[#6c6c6c]">District</span>
              </label>
              <Select
                className="w-full"
                value={filters.district}
                onChange={handleDistrictChange}
                placeholder="Select District"
              >
                <Option value="all">All Districts</Option>
                {reports.districts.map((district) => (
                  <Option key={district} value={district}>
                    {district}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div
          variants={fadeIn}
          className="card bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#b5dcd6] text-[#018b76]">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#6c6c6c]">
                  Total Sales
                </h3>
                <p className="text-2xl font-bold text-[#018b76]">
                  ৳
                  {reports.salesPerformance?.totalRevenue?.toLocaleString() ||
                    0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="card bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#ffd8b5] text-[#ffa245]">
                <FiPackage size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#6c6c6c]">
                  Avg. Order Value
                </h3>
                <p className="text-2xl font-bold text-[#ffa245]">
                  ৳
                  {reports.salesPerformance?.averageOrderValue?.toFixed(2) || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="card bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#b5dcd6] text-[#179784]">
                <FiUsers size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#6c6c6c]">
                  Total Orders
                </h3>
                <p className="text-2xl font-bold text-[#179784]">
                  {reports.salesPerformance?.orderCount?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="card bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#cceeff] text-[#0077cc]">
                <FiArchive size={24} />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-[#6c6c6c]">
                  Total Stock Value
                </h3>
                <p className="text-2xl font-bold text-[#0077cc]">
                  ৳{totalStockValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Order Status Pie Chart */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="card bg-white shadow-md"
        >
          <div className="card-body">
            <h2 className="card-title text-[#018b76]">
              <FiPieChart className="mr-2" />
              Order Status Distribution
            </h2>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reports.orderStatusSummary || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(reports.orderStatusSummary || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      borderColor: "#b5dcd6",
                      borderRadius: "0.5rem",
                      boxShadow: "0 2px 8px rgba(1, 139, 118, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Product Performance Bar Chart */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="card bg-white shadow-md"
        >
          <div className="card-body">
            <h2 className="card-title text-[#018b76]">
              <FiBarChart2 className="mr-2" />
              Top Performing Products
            </h2>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reports.productPerformance || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="productName" tick={{ fill: "#6c6c6c" }} />
                  <YAxis tick={{ fill: "#6c6c6c" }} />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      borderColor: "#b5dcd6",
                      borderRadius: "0.5rem",
                      boxShadow: "0 2px 8px rgba(1, 139, 118, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalQuantity"
                    name="Quantity Sold"
                    fill="#018b76"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="totalRevenue"
                    name="Revenue (৳)"
                    fill="#ffa245"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* District-wise Orders */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="card bg-white shadow-md"
        >
          <div className="card-body">
            <h2 className="card-title text-[#018b76]">
              <FiMapPin className="mr-2" />
              District-wise Orders
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="bg-[#b5dcd6] text-[#018b76]">District</th>
                    <th className="bg-[#b5dcd6] text-[#018b76]">Orders</th>
                    <th className="bg-[#b5dcd6] text-[#018b76]">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.districtWiseOrders?.map((item, index) => (
                    <motion.tr
                      key={item.district}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#b5dcd6]"
                    >
                      <td>{item.district}</td>
                      <td>{item.orderCount}</td>
                      <td>৳{item.totalRevenue?.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="card bg-white shadow-md"
        >
          <div className="card-body">
            <h2 className="card-title text-[#018b76]">
              <FiAward className="mr-2" />
              Top Customers
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="bg-[#b5dcd6] text-[#018b76]">Customer</th>
                    <th className="bg-[#b5dcd6] text-[#018b76]">Mobile</th>
                    <th className="bg-[#b5dcd6] text-[#018b76]">Orders</th>
                    <th className="bg-[#b5dcd6] text-[#018b76]">Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.customerInsights?.map((item, index) => (
                    <motion.tr
                      key={`${item.mobile}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#b5dcd6]"
                    >
                      <td>{item.customerName}</td>
                      <td>{item.mobile}</td>
                      <td>{item.orderCount}</td>
                      <td>৳{item.totalSpent?.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderAnalyticsDashboard;
