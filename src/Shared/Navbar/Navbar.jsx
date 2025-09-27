// Enhanced Navbar.jsx with fixed mobile dropdown and updated menu order
import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "../Topbar/Topbar";
import { useCart } from "../../hooks/useCart";
import {
  ShoppingCart,
  Menu,
  ChevronDown,
  X,
  Home,
  Info,
  Phone,
  Package,
  Rss, // Added Rss icon
} from "lucide-react";
import { useAuth } from "../../main";
import ProfileDropdown from "../../Dashboard/ProfileDropdown/ProfileDropdown";
import useCategories from "../../hooks/useCategories";
import logo from "../../assets/Logo/logo.png";

const Navbar = () => {
  const cart = useCart();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showTopbar, setShowTopbar] = useState(true);
  const { user } = useAuth();
  const [categories] = useCategories();
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const drawerRef = useRef(null);

  const navItems = [
    { name: "Home", to: "/", icon: <Home size={18} className="mr-2" /> },
    {
      name: "About Us",
      to: "/about",
      icon: <Info size={18} className="mr-2" />,
    },
    { name: "Blog", to: "/blogs", icon: <Rss size={18} className="mr-2" /> }, // Added Blog link
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProductsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDrawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target)
      ) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    setShowProductsDropdown(false);
  }, [location.pathname]);

  const handleLinkClick = () => {
    setDrawerOpen(false);
    setShowProductsDropdown(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowTopbar(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.div
        className="fixed w-full z-50 bg-brand-teal-500 text-white max-w-7xl shadow-lg"
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence>
          {showTopbar && (
            <motion.div
              key="topbar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <Topbar />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="px-6 py-3 flex justify-between items-center bg-brand-teal-500"
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-brand-orange-base hover:text-brand-orange-light transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center">
            <Link to="/">
              {" "}
              <img className="w-[45px]" src={logo} alt="Logo" />
            </Link>
          </div>

          <div className="hidden md:flex gap-6 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center text-brand-cream hover:text-white px-3 py-1 transition-all duration-200 text-lg rounded-md ${
                  isActive
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`
              }
            >
              <Home size={18} className="mr-2" />
              Home
            </NavLink>

            <div className="relative" ref={dropdownRef}>
              <button
                className={`flex items-center gap-1 text-brand-cream hover:text-white px-3 py-1 transition-all duration-200 text-lg rounded-md ${
                  location.pathname.startsWith("/products")
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`}
                onClick={() => setShowProductsDropdown(!showProductsDropdown)}
                aria-expanded={showProductsDropdown}
              >
                <Package size={18} className="mr-1" />
                Categories
                <ChevronDown
                  size={16}
                  className={`mt-0.5 transition-transform ${
                    showProductsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showProductsDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-56 bg-brand-teal-400 border border-brand-teal-200 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <Link
                    to="/products/all"
                    className="flex items-center px-4 py-2.5 text-brand-cream hover:bg-brand-teal-300 hover:text-white transition-colors"
                    onClick={() => setShowProductsDropdown(false)}
                  >
                    <Package size={16} className="mr-2" />
                    All Products
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products/${cat.category}`}
                      className="block px-4 py-2.5 text-brand-cream hover:bg-brand-teal-300 hover:text-white transition-colors border-t border-brand-teal-300"
                      onClick={() => setShowProductsDropdown(false)}
                    >
                      {cat.en}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex items-center text-brand-cream hover:text-white px-3 py-1 transition-all duration-200 text-lg rounded-md ${
                  isActive
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`
              }
            >
              <Info size={18} className="mr-2" />
              About Us
            </NavLink>

            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `flex items-center text-brand-cream hover:text-white px-3 py-1 transition-all duration-200 text-lg rounded-md ${
                  isActive
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`
              }
            >
              <Rss size={18} className="mr-2" />
              Blog
            </NavLink>

            <NavLink
              to="/cart"
              className="relative p-2 rounded-full hover:bg-brand-teal-400 transition-colors"
              aria-label="Shopping cart"
            >
              <div className="indicator">
                <span className="indicator-item bg-brand-orange-base text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cart?.length}
                </span>
                <ShoppingCart size={20} className="text-brand-cream" />
              </div>
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link
                to="/track-order"
                className="bg-brand-orange-base hover:bg-brand-orange-dark px-4 py-2 rounded-md text-white transition-all shadow-md hover:shadow-brand-orange/40 font-medium"
              >
                Track Your Order
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden gap-4">
            <NavLink
              to="/cart"
              className="relative p-1"
              aria-label="Shopping cart"
            >
              <div className="indicator">
                <span className="indicator-item bg-brand-orange-base text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cart?.length}
                </span>
                <ShoppingCart size={20} className="text-brand-cream" />
              </div>
            </NavLink>

            {user && <ProfileDropdown />}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          ></motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={drawerRef}
        initial={{ x: -320 }}
        animate={{ x: isDrawerOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-80 bg-brand-teal-500 z-50 shadow-2xl"
      >
        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-center border-b border-brand-teal-300 pb-4">
            <div className="flex items-center">
              <Link to="/">
                <img className="w-[45px]" src={logo} alt="Logo" />
              </Link>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-brand-cream hover:text-white p-1 rounded-full hover:bg-brand-teal-400"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col space-y-2 pt-6 flex-grow">
            <NavLink
              to="/"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center text-brand-cream hover:text-white py-3 px-4 rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`
              }
            >
              <Home size={18} className="mr-2" />
              Home
            </NavLink>

            <div className="relative">
              <button
                onClick={() => setShowProductsDropdown(!showProductsDropdown)}
                className={`w-full flex items-center justify-between text-left py-3 px-4 rounded-lg transition-all ${
                  showProductsDropdown
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "text-brand-cream hover:bg-brand-teal-400 hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  <Package size={18} className="mr-2" />
                  <span>Categories</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showProductsDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showProductsDropdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-8 mt-2 space-y-1 border-l-2 border-brand-teal-300 pl-4 overflow-hidden"
                  >
                    <NavLink
                      to="/products/all"
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center py-2.5 px-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-brand-teal-300 text-white"
                            : "text-brand-cream hover:bg-brand-teal-400 hover:text-white"
                        }`
                      }
                    >
                      <Package size={16} className="mr-2" />
                      All Products
                    </NavLink>
                    {categories.map((cat) => (
                      <NavLink
                        key={cat._id}
                        to={`/products/${cat.category}`}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                          `block py-2.5 px-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-brand-teal-300 text-white"
                              : "text-brand-cream hover:bg-brand-teal-400 hover:text-white"
                          }`
                        }
                      >
                        {cat.en}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/about"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center text-brand-cream hover:text-white py-3 px-4 rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`
              }
            >
              <Info size={18} className="mr-2" />
              About Us
            </NavLink>

            <NavLink
              to="/blogs"
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center text-brand-cream hover:text-white py-3 px-4 rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-teal-300 text-white shadow-md"
                    : "hover:bg-brand-teal-400"
                }`
              }
            >
              <Rss size={18} className="mr-2" />
              Blog
            </NavLink>

          </div>

          {!user && (
            <div className="mt-auto pt-4 border-t border-brand-teal-300">
              <Link
                to="/track-order"
                onClick={handleLinkClick}
                className="block w-full text-center bg-brand-orange-base hover:bg-brand-orange-dark px-4 py-2.5 rounded-lg text-white transition-colors shadow-md font-medium"
              >
                Track Your Order
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Navbar;