import { createBrowserRouter } from "react-router-dom";
import Home from "../Pages/HomePage/Home/Home";
import Main from "../Layout/Main/Main";
import Cart from "../Pages/Cart/Cart";
import Checkout from "../Pages/Checkout/Checkout";
import Confirm from "../Pages/Confirm/Confirm";
import Login from "../Authentication/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Products from "../Dashboard/Products/Products";
import ProductDetails from "../Pages/ProductDetails/ProductDetails";
import OrderRequest from "../Dashboard/OrderRequest/OrderRequest";
import PendingOrder from "../Dashboard/ProcessingOrder/ProcessingOrder";
import FinalOrder from "../Dashboard/FinalOrder/FinalOrder";
import BannerContent from "../Dashboard/BannerContent/BannerContent";
import ApprovedOrder from "../Dashboard/ApprovedOrder/ApprovedOrder";
import OurProducts from "../Pages/OurProducts/OurProducts";
import YoutubeContent from "../Dashboard/YoutubeContent/YoutubeContent";
import CancelOrder from "../Dashboard/CancelOrder/CancelOrder";
import Dashboard from "../Dashboard/DashboardHome/Dashboard";
import AboutUs from "../Pages/About/AboutUs";
import Category from "../Dashboard/Category/Category";
import ManageAdmin from "../Dashboard/ManageAdmin/ManageAdmin";
import TrackOrder from "./../Shared/TrackOrder/TrackOrder";
import DeliveredOrders from "../Dashboard/DeliveredOrders/DeliveredOrders";
import CategoryPage from "../Pages/DynamicCategoryPage/CategoryPage";
import BlogPage from "../Pages/Blog/BlogPage";
import SingleBlogPost from "../Pages/Blog/SingleBlogPost";
import ManageBlogs from "../Dashboard/Blog/ManageBlogs";
import ManageReviews from "../Dashboard/Reviews/ManageReviews";
import DashboardLayout from "../Layout/Dashboard/DashboardLayout";
import ManageLandingPage from "../Dashboard/LandingPage/ManageLandingPage";
import OfferPage from "../Pages/OfferPage/OfferPage";
import OfferLayout from "../Layout/OfferPage/OfferLayout"; // Import the new layout

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      // Public Routes (excluding /offer)
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/product/:id",
        element: <ProductDetails />,
      },
      {
        path: "/products/:category",
        element: <OurProducts />,
      },
      {
        path: "/category/:categoryName",
        element: <CategoryPage />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/order-success",
        element: <Confirm />,
      },
      {
        path: "/track-order",
        element: <TrackOrder />,
      },
      {
        path: "/login-admin",
        element: <Login />,
      },
      {
        path: "/blogs",
        element: <BlogPage />,
      },
      {
        path: "/blog/:id",
        element: <SingleBlogPost />,
      },
    ],
  },
  // Offer Page Route with its own layout
  {
    path: "/offer",
    element: <OfferLayout />,
    children: [
      {
        index: true,
        element: <OfferPage />,
      },
    ],
  },
  // Dashboard Routes
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "manage-admin",
        element: <ManageAdmin />,
      },
      {
        path: "category",
        element: <Category />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "pending-orders",
        element: <OrderRequest />,
      },
      {
        path: "approved-orders",
        element: <ApprovedOrder />,
      },
      {
        path: "processing-orders",
        element: <PendingOrder />,
      },
      {
        path: "shipping-orders",
        element: <FinalOrder />,
      },
      {
        path: "delivered-orders",
        element: <DeliveredOrders />,
      },
      {
        path: "cancel-orders",
        element: <CancelOrder />,
      },
      {
        path: "banner",
        element: <BannerContent />,
      },
      {
        path: "youtube",
        element: <YoutubeContent />,
      },
      {
        path: "manage-blogs",
        element: <ManageBlogs />,
      },
      {
        path: "manage-reviews",
        element: <ManageReviews />,
      },
      {
        path: "manage-landing-page",
        element: <ManageLandingPage />,
      },
    ],
  },
]);