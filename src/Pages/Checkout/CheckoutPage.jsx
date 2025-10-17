import { useState } from "react";
import { useLocation } from "react-router-dom";
import Checkout from "./Checkout";

const CheckoutPage = () => {
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  const handleVariantChange = (itemId, newVariantWeight) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items.map((item) => {
        if (item._id === itemId) {
          const newVariant = item.variants.find(
            (v) => v.weight === newVariantWeight
          );
          return {
            ...item,
            variant: newVariant,
            price: newVariant.price,
            weight: newVariant.weight,
          };
        }
        return item;
      }),
    }));
  };

  const handleRemoveItem = (itemId) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items.filter((item) => item._id !== itemId),
    }));
  };

  return (
    <Checkout
      order={order}
      onQuantityChange={handleQuantityChange}
      onVariantChange={handleVariantChange}
      onRemoveItem={handleRemoveItem}
    />
  );
};

export default CheckoutPage;