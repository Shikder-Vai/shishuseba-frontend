import { useState, useEffect } from "react";

const useOrderFromLocalStorage = () => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const storedOrder = localStorage.getItem("order");
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        setOrder(parsedOrder);
      } catch (error) {
        console.error("Failed to parse order from localStorage:", error);
      }
    }
  }, []);

  return order;
};

export default useOrderFromLocalStorage;
