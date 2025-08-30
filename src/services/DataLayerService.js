window.dataLayer = window.dataLayer || [];

/**
 * Pushes event to the dataLayer.
 * @param {string} event -
 * @param {object} data -
 */
const pushEvent = (event, data) => {
  window.dataLayer.push({
    event,
    ...data,
  });
};

/**
 * Pushes user login/logout state.
 * @param {object} user
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
 * @param {object} product
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
 * @param {object} product
 * @param {number} quantity
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
 * @param {object} product
 * @param {number} quantity
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
 * Pushes a "purchase" event.
 * @param {object} orderDetails
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
      value: orderDetails.totalPrice,
      tax: orderDetails.taxPrice,
      shipping: orderDetails.shippingPrice,
      currency: "BDT",
      items: items,
    },
    user_data: orderDetails.userData,
  });
};

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
 * @param {object} product
 */
export const pushRemoveFromCart = (product) => {
  pushEvent("remove_from_cart", {
    ecommerce: {
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    },
  });
};
