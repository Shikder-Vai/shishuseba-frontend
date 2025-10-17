export const proceedNow = (navigate, cartItems, subtotal, total, shippingCost) => {
  try {
    if (!cartItems || cartItems.length === 0) {
      console.error("Cannot proceed to checkout with an empty cart.");
      return; 
    }

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