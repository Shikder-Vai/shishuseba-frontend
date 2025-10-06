import { useState, useEffect } from "react";

const useOrderFromLocalStorage = () => {
  const [order, setOrder] = useState(null);

  const updateOrder = () => {
    const storedOrder = localStorage.getItem("order");
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        setOrder(parsedOrder);
      } catch (error) {
        console.error("Failed to parse order from localStorage:", error);
        setOrder(null);
      }
    } else {
      setOrder(null);
    }
  };

  useEffect(() => {
    updateOrder();

    window.addEventListener("storage", updateOrder);
    window.addEventListener("cart-updated", updateOrder);

    return () => {
      window.removeEventListener("storage", updateOrder);
      window.removeEventListener("cart-updated", updateOrder);
    };
  }, []);

  return order;
};

export default useOrderFromLocalStorage;