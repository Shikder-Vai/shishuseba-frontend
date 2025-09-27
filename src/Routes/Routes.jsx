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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/cart",
        element: <Cart></Cart>,
      },
      {
        path: "/about",
        element: <AboutUs></AboutUs>,
      },
      {
        path: "/product/:id",
        element: <ProductDetails></ProductDetails>,
      },
      {
        path: "/products/:category",
        element: <OurProducts></OurProducts>,
      },
      {
        path: "/category/:categoryName",
        element: <CategoryPage />,
      },
      {
        path: "/checkout",
        element: <Checkout></Checkout>,
      },
      {
        path: "/order-success",
        element: <Confirm></Confirm>,
      },
      {
        path: "/track-order",
        element: <TrackOrder></TrackOrder>,
      },
      {
        path: "/login-admin",
        element: <Login></Login>,
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard></Dashboard>
          </PrivateRoute>
        ),
      },
      {
        path: "/manage-admin",
        element: (
          <PrivateRoute>
            <ManageAdmin></ManageAdmin>
          </PrivateRoute>
        ),
      },
      {
        path: "/category",
        element: (
          <PrivateRoute>
            <Category></Category>
          </PrivateRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <PrivateRoute>
            <Products></Products>
          </PrivateRoute>
        ),
      },
      {
        path: "/pending-orders",
        element: (
          <PrivateRoute>
            <OrderRequest></OrderRequest>
          </PrivateRoute>
        ),
      },
      {
        path: "/approved-orders",
        element: (
          <PrivateRoute>
            <ApprovedOrder></ApprovedOrder>
          </PrivateRoute>
        ),
      },
      {
        path: "/processing-orders",
        element: (
          <PrivateRoute>
            <PendingOrder></PendingOrder>
          </PrivateRoute>
        ),
      },
      {
        path: "/shipping-orders",
        element: (
          <PrivateRoute>
            <FinalOrder></FinalOrder>
          </PrivateRoute>
        ),
      },
      {
        path: "/delivered-orders",
        element: (
          <PrivateRoute>
            <DeliveredOrders></DeliveredOrders>
          </PrivateRoute>
        ),
      },
      {
        path: "/cancel-orders",
        element: (
          <PrivateRoute>
            <CancelOrder></CancelOrder>
          </PrivateRoute>
        ),
      },
      {
        path: "/banner",
        element: (
          <PrivateRoute>
            <BannerContent></BannerContent>
          </PrivateRoute>
        ),
      },
      {
        path: "/youtube",
        element: (
          <PrivateRoute>
            <YoutubeContent></YoutubeContent>
          </PrivateRoute>
        ),
      },
      {
        path: "/blogs",
        element: <BlogPage />,
      },
      {
        path: "/blog/:id",
        element: <SingleBlogPost />,
      },
      {
        path: "/manage-blogs",
        element: (
          <PrivateRoute>
            <ManageBlogs />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
