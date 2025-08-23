import React, { useEffect, useState } from "react";
import { useAuth } from "../../main";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Categories from "../Categories/Categories";
import { FiLogOut, FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiDollarSign, FiPieChart } from "react-icons/fi";

const DashboardHome = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login-admin");
    }

    if (user) {
      fetchDashboardData();
    }
  }, [loading, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch all data in parallel
      const [statsRes, recentRes, popularRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent?limit=5'),
        fetch('/api/dashboard/popular-products')
      ]);

      const [statsData, recentData, popularData] = await Promise.all([
        statsRes.json(),
        recentRes.json(),
        popularRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (recentData.success) setRecentOrders(recentData.data);
      if (popularData.success) setPopularProducts(popularData.data);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancel': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="mr-1" />;
      case 'approved': return <FiCheckCircle className="mr-1" />;
      case 'processing': return <FiTruck className="mr-1" />;
      case 'delivered': return <FiShoppingBag className="mr-1" />;
      case 'cancel': return <FiXCircle className="mr-1" />;
      default: return <FiClock className="mr-1" />;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name || user?.email}
          </h1>
          <p className="text-gray-600 mt-1 capitalize">Role: {user?.role}</p>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          <FiLogOut className="mr-2" />
          Log Out
        </button>
      </div>

      {/* Stats Cards */}
      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-32 animate-pulse"></div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiShoppingBag className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">৳{stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Avg. Order Value</p>
                <h3 className="text-2xl font-bold mt-1">৳{Math.round(stats.averageOrderValue).toLocaleString()}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiPieChart className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Delivered Orders</p>
                <h3 className="text-2xl font-bold mt-1">{stats.delivered}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiCheckCircle className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders and Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <a href="/orders" className="text-sm text-blue-500 hover:underline">View All</a>
          </div>
          
          {loadingData ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order._id.$oid} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <p className="font-medium">Order #{order._id.$oid.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {order.user.name} • {order.user.district}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="ml-4 font-medium">৳{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Products</h2>
          
          {loadingData ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {popularProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover rounded-md mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">৳{product.price}</p>
                    <p className="text-xs text-gray-500">৳{product.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Status Distribution */}
      {stats && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{stats.approved}</div>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{stats.processing}</div>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.delivered}</div>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-500">{stats.cancelled}</div>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
        <Categories />
      </div>
    </div>
  );
};

export default DashboardHome;