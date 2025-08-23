// import { useEffect, useRef } from "react";
// import { useLocation } from "react-router-dom";

// export default function TrackingWrapper({ children }) {
//   const location = useLocation();
//   const isFirstLoad = useRef(true);

//   // Helper: Get cart product IDs from localStorage
//   const getCartProductIds = () => {
//     try {
//       const cart = JSON.parse(localStorage.getItem("cart") || "[]");
//       if (Array.isArray(cart) && cart.length > 0) {
//         return cart.map((item) => item.id || item._id).filter(Boolean);
//       }
//     } catch (e) {
//       console.warn("Could not parse cart from localStorage", e);
//     }
//     return [];
//   };

//   // --- Page View Tracking ---
//   useEffect(() => {
//     if (isFirstLoad.current) {
//       isFirstLoad.current = false;
//       return;
//     }
//     window.dataLayer = window.dataLayer || [];
//     window.dataLayer.push({
//       event: "page_view",
//       page_path: location.pathname,
//       page_title: document.title,
//     });
//   }, [location]);

//   // --- Click Tracking ---
//   useEffect(() => {
//     const handleClick = (event) => {
//       const target = event.target.closest("a, button");
//       if (!target) return;

//       let productIds = [];

//       // 1. Get from data-product-id
//       const dataId = target.getAttribute("data-product-id");
//       if (dataId) {
//         productIds = [dataId];
//       }

//       // 2. Get from URL
//       else if (location.pathname.startsWith("/product/")) {
//         const urlId = location.pathname.split("/product/")[1];
//         if (urlId) productIds = [urlId];
//       }

//       // 3. Get from cart if still empty
//       if (productIds.length === 0) {
//         productIds = getCartProductIds();
//       }
//       // this is for GMT output
//       window.dataLayer = window.dataLayer || [];
//       window.dataLayer.push({
//         event: "click",
//         element_tag: target.tagName,
//         element_text: target.innerText.trim(),
//         element_id: target.id || null,
//         element_class: target.className || null,
//         product_ids: productIds.length > 0 ? productIds : null,
//       });
//     };

//     document.addEventListener("click", handleClick);
//     return () => document.removeEventListener("click", handleClick);
//   }, [location]);

//   return <>{children}</>;
// }
