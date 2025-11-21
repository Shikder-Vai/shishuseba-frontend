import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Image,
  Youtube,
  Newspaper,
  Star,
  Home,
  Truck,
  CheckCircle,
  XCircle,
  Archive,
  Landmark,
} from "lucide-react";
import Topbar from "../../Shared/Topbar/Topbar";

const dashboardLinks = [
  { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { to: "/dashboard/products", icon: <Package size={20} />, label: "Products" },
  {
    to: "/dashboard/inventory",
    icon: <Package size={20} />,
    label: "Inventory",
  },
  {
    to: "/dashboard/category",
    icon: <Archive size={20} />,
    label: "Categories",
  },
  {
    to: "/dashboard/pending-orders",
    icon: <ShoppingCart size={20} />,
    label: "Order Requests",
  },
  {
    to: "/dashboard/approved-orders",
    icon: <CheckCircle size={20} />,
    label: "Approved Orders",
  },
  {
    to: "/dashboard/processing-orders",
    icon: <Truck size={20} />,
    label: "Processing Orders",
  },
  {
    to: "/dashboard/shipping-orders",
    icon: <Truck size={20} />,
    label: "Shipping Orders",
  },
  {
    to: "/dashboard/delivered-orders",
    icon: <CheckCircle size={20} />,
    label: "Delivered Orders",
  },
  {
    to: "/dashboard/cancel-orders",
    icon: <XCircle size={20} />,
    label: "Cancelled Orders",
  },
  {
    to: "/dashboard/manage-reviews",
    icon: <Star size={20} />,
    label: "Manage Reviews",
  },
  {
    to: "/dashboard/banner",
    icon: <Image size={20} />,
    label: "Banner Content",
  },
  {
    to: "/dashboard/youtube",
    icon: <Youtube size={20} />,
    label: "YouTube Content",
  },
  {
    to: "/dashboard/manage-blogs",
    icon: <Newspaper size={20} />,
    label: "Manage Blogs",
  },
  {
    to: "/dashboard/manage-admin",
    icon: <Users size={20} />,
    label: "Manage Admin",
  },
  {
    to: "/dashboard/landing-pages",
    icon: <Landmark size={20} />,
    label: "Landing Pages",
  },
];

const NavItem = ({ to, icon, label }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 text-sm rounded-lg transition-colors ${
          isActive
            ? "bg-brand-teal-base text-white shadow-md"
            : "text-gray-700 hover:bg-brand-teal-light hover:text-brand-teal-base"
        }`
      }
    >
      {icon}
      <span className="ml-3">{label}</span>
    </NavLink>
  </li>
);

const DashboardLayout = () => {
  return (
    <div>
      <Topbar />
      <div className="flex min-h-screen">
        <aside className="w-64 bg-white border-r border-gray-200 px-4 fixed top-[48px] bottom-0 overflow-y-auto">
          <button
            type="button"
            aria-label="Back to Home"
            className="flex items-center m-2 btn"
            onClick={() => (window.location.href = "/")}
          >
            <Home size={20} />
            Back to Home
          </button>
          <nav>
            <ul>
              {dashboardLinks.map((link) => (
                <NavItem key={link.to} {...link} />
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 ml-64 px-5  mt-[48px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
