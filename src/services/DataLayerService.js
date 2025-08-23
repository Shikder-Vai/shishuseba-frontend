window.dataLayer = window.dataLayer || [];

/**
 * Pushes a standardized event to the dataLayer.
 * @param {string} event - The name of the event (e.g., 'purchase', 'add_to_cart').
 * @param {object} data - The data payload for the event.
 */
const pushEvent = (event, data) => {
  window.dataLayer.push({
    event,
    ...data,
  });
};

/**
 * Pushes user login/logout state.
 * @param {object} user - The user object from your app's state.
 */
export const pushLogState = (user) => {
  const logStateData = {
    logState: user ? "Logged In" : "Logged Out",
    userId: user ? user.id : undefined,
    customerEmail: user ? user.email : undefined,
    customerInfo: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          // Add other relevant user details if need
        }
      : undefined,
  };
  pushEvent("logState", logStateData);
};

/**
 * @param {string} pagePath
 * @param {string} pageTitle
 */
export const pushPageView = (pagePath, pageTitle) => {
  pushEvent("home_page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * "view item" event for a product detail page.
 * @param {object} product - The product object from your API.
 */
export const pushViewItem = (product) => {
  pushEvent("view_item", {
    ecommerce: {
      currency: "BDT",
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          item_brand: product.brand,
          item_category: product.category,
        },
      ],
    },
  });
};

/**
 * "add to cart" event.
 * @param {object} product - The product being added.
 * @param {number} quantity - The quantity being added.
 */
export const pushAddToCart = (product, quantity) => {
  pushEvent("add_to_cart", {
    ecommerce: {
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          item_brand: product.brand,
          item_category: product.category,
          quantity: quantity,
        },
      ],
    },
  });
};

/**
 * "buy now" event.
 * @param {object} product - The product being added.
 * @param {number} quantity - The quantity being added.
 */
export const pushByNow = (product, quantity) => {
  pushEvent("buy_now", {
    ecommerce: {
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          item_brand: product.brand,
          item_category: product.category,
          quantity: quantity,
        },
      ],
    },
  });
};

/**
 * "purchase" event after a successful checkout.
 * @param {object} orderDetails - The final order object from backend.
 */
export const pushPurchase = (orderDetails) => {
  const items = orderDetails.products.map((item) => ({
    item_id: item.productId,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  pushEvent("purchase", {
    ecommerce: {
      transaction_id: orderDetails._id,
      affiliation: "ShishuSeba",
      value: orderDetails.totalPrice,
      tax: orderDetails.taxPrice,
      shipping: orderDetails.shippingPrice,
      currency: "BDT",
      items: items,
    },
  });
};

// ... (keep your existing functions like pushEvent, pushAddToCart, etc.)

/**
 * Pushes a "view cart" event.
 * @param {Array} cartItems
 * @param {number} cartTotal
 */
export const pushViewCart = (cartItems, cartTotal) => {
  const items = cartItems.map((item) => ({
    item_id: item._id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  pushEvent("view_cart", {
    ecommerce: {
      currency: "BDT",
      value: cartTotal,
      items: items,
    },
  });
};

/**
 * Pushes a "view checkout" event.
 * @param {Array} cartItems -
 * @param {number} cartTotal -
 */
export const pushBeginCheckout = (cartItems, cartTotal) => {
  const items = cartItems.map((item) => ({
    item_id: item._id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  pushEvent("view_checkout", {
    ecommerce: {
      currency: "BDT",
      value: cartTotal,
      items: items,
    },
  });
};

/**
 * Pushes a "remove from cart" event.
 * @param {object} product - The product being removed.
 */
export const pushRemoveFromCart = (product) => {
  pushEvent("remove_from_cart", {
    ecommerce: {
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity, // The quantity that was in the cart
        },
      ],
    },
  });
};
