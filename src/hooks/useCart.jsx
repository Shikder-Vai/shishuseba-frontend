// src/hooks/useCart.js
import { useState, useEffect } from "react";

export function useCart() {
  const [cartItems, setCartItems] = useState([]);

  const getCartFromStorage = () => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to parse cart from localStorage", err);
      return [];
    }
  };

  useEffect(() => {
    // Fetch on first render
    setCartItems(getCartFromStorage());

    // Listen for manual updates via custom event
    const updateListener = () => {
      setCartItems(getCartFromStorage());
    };

    window.addEventListener("cart-updated", updateListener);

    return () => {
      window.removeEventListener("cart-updated", updateListener);
    };
  }, []);

  return cartItems;
}
