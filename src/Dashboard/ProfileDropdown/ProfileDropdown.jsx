import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../main";
import {
  FiUser,
  FiHome,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiTruck,
  FiXCircle,
  FiImage,
  FiYoutube,
  FiLogOut,
  FiChevronDown,
  FiDatabase,
  FiUsers,
  FiSend,
  FiFileText,
  FiStar
} from "react-icons/fi";

const dropdownLinks = [
  { to: "/dashboard", icon: FiHome, label: "Dashboard" },
  { to: "/manage-admin", icon: FiUsers, label: "Manage Admin" },
  { to: "/category", icon: FiDatabase, label: "Category" },
  { to: "/products", icon: FiShoppingBag, label: "Products" },
  { to: "/pending-orders", icon: FiClock, label: "Pending Orders" },
  { to: "/approved-orders", icon: FiCheckCircle, label: "Approved Orders" },
  { to: "/processing-orders", icon: FiRefreshCw, label: "Processing Orders" },
  { to: "/shipping-orders", icon: FiTruck, label: "Shipping Orders" },
  { to: "/delivered-orders", icon: FiSend, label: "Delivered Orders" },
  { to: "/cancel-orders", icon: FiXCircle, label: "Canceled Orders" },
  { to: "/banner", icon: FiImage, label: "Banner Management" },
  { to: "/youtube", icon: FiYoutube, label: "YouTube Videos" },
  { to: "/manage-blogs", icon: FiFileText, label: "Manage Blogs" },
  { to: "/manage-reviews", icon: FiStar, label: "Manage Reviews" },
  // { to: "/settings", icon: FiSettings, label: "Account Settings" },
  // { to: "/help", icon: FiHelpCircle, label: "Help Center" },
];

const ProfileDropdown = () => {
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login-admin");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-teal-100 rounded-full p-1 transition-all"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="relative">
          <img
            src={user?.avatar || "https://www.kindpng.com/picc/m/368-3685978_admin-icon-gray-hd-png-download.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-gray-800">
            {user?.name || "Admin User"}
          </span>
          <span className="text-xs text-gray-500">Admin</span>
        </div>
        <FiChevronDown
          className={`hidden md:block text-gray-500 transition-transform ${
            open ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 origin-top-right bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden"
          >
            {/* Profile Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <img
                src={user?.avatar || "https://www.kindpng.com/picc/m/368-3685978_admin-icon-gray-hd-png-download.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>

            {/* Navigation Links */}
            <ul className="py-1 max-h-96 overflow-y-auto">
              {dropdownLinks.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm transition-colors ${
                        isActive
                          ? "bg-brand-teal-50 text-brand-teal-base font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    <Icon className="mr-3 text-gray-500 flex-shrink-0" size={16} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Footer with Logout */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <FiLogOut className="mr-3" size={16} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
