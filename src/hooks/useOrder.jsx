export const proceedNow = (navigate, subtotal, total, shippingCost) => {
  try {
    const items = localStorage.getItem("cart");
    const cartItems = items ? JSON.parse(items) : [];

    const order = {
      items: cartItems,
      subtotal,
      shippingCost,
      total,
    };
    navigate("/checkout", { state: { order } });
  } catch (error) {
    console.error("Failed to proceed with order", error);
  }
};