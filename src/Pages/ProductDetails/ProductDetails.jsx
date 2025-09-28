import { useNavigate, useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  ShoppingCart,
  Star,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import useScrollToTop from "../../hooks/useScrollToTop";
import {
  pushViewItem,
  pushAddToCart,
  pushByNow,
} from "../../services/DataLayerService";
import RelatedProducts from "../../components/RelatedProducts";
import BoldColonText from "../../components/TextFormatting";

const ProductDetails = () => {
  useScrollToTop();
  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
  // Set the first variant as selected when item loads
  useEffect(() => {
    if (item?.variants?.length > 0) {
      setSelectedVariant(item.variants[0]);
    }
  }, [item]);

  // start gtm code
  useEffect(() => {
    if (item && selectedVariant) {
      const productWithPrice = {
        ...item,
        price: selectedVariant.price,
      };
      pushViewItem(productWithPrice);
    }
  }, [item, selectedVariant]);
  // end gtm code

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  // Prepare product for cart/order
  const prepareProduct = () => {
    return {
      ...item,
      ...(selectedVariant && {
        weight: selectedVariant.weight,
        price: selectedVariant.price,
        variant: selectedVariant,
      }),
      quantity: quantity,
    };
  };

  // Buy Now:
  const handleBuyNow = () => {
    const product = prepareProduct();

    // GTM event
    pushByNow(product, quantity);

    // Create cart and order objects for checkout
    const cartItems = [product];
    const subtotal = product.price * product.quantity;
    const shippingCost = subtotal >= 1000 ? 0 : 80; // Same logic as in Cart.jsx
    const total = subtotal + shippingCost;

    const order = {
      items: cartItems,
      subtotal,
      shippingCost,
      total,
    };
    // localStorage.setItem("cart", JSON.stringify(cartItems));
    localStorage.setItem("order", JSON.stringify(order));
    navigate("/checkout");
  };

  // Add to Cart:
  const handleAddtoCart = () => {
    const product = prepareProduct();
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyExists = currentCart.some(
      (cartItem) =>
        cartItem._id === product._id &&
        (!cartItem.variant ||
          !product.variant ||
          cartItem.variant.weight === product.variant.weight)
    );

    if (alreadyExists) {
      Swal.fire({
        position: "center",
        icon: "info",
        title: "Already in cart!",
        showConfirmButton: false,
        background: "#ffffff",
        color: "#6c6c6c",
        timer: 1000,
      });
      return;
    }

    currentCart.push(product);
    localStorage.setItem("cart", JSON.stringify(currentCart));
    pushAddToCart(product, 1);
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Product added to cart!",
      showConfirmButton: false,
      background: "#ffffff",
      color: "#6c6c6c",
      timer: 1000,
    });

    window.dispatchEvent(new Event("cart-updated"));
  };

  if (isLoading) {
    return <Loader></Loader>;
  }
  if (isError) {
    return <p>{isError}</p>;
  }

  // Create an array of images for the gallery
  const images = [item?.image, ...(item?.additionalImages || [])].filter(
    Boolean
  );

  return (
    <div className="py-8 md:py-12 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <a
                href="/"
                className="text-brand-gray-base hover:text-brand-teal-base text-sm"
              >
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronDown className="w-4 h-4 text-brand-gray-light transform -rotate-90" />
                <a
                  href="#"
                  className="ml-1 text-brand-gray-base hover:text-brand-teal-base text-sm md:ml-2"
                >
                  Products
                </a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronDown className="w-4 h-4 text-brand-gray-light transform -rotate-90" />
                <span className="ml-1 text-sm font-medium text-brand-teal-base md:ml-2">
                  {item?.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-xl shadow-soft overflow-hidden aspect-square flex items-center justify-center p-4 border border-brand-gray-light">
              <img
                src={images[selectedImage]}
                alt={item?.name}
                className="w-full h-full object-contain transition-opacity duration-300"
              />
              {item?.discount && (
                <div className="absolute top-4 left-4 bg-brand-orange-base text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                  {item.discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === idx
                        ? "border-brand-teal-base"
                        : "border-transparent hover:border-brand-gray-light"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${item?.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-gray-base mb-2">
                {item?.name}
              </h1>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 fill-brand-orange-base text-brand-orange-base '}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-brand-gray-base">
                  {item?.reviewCount}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-brand-teal-base">
                  {selectedVariant?.price || item?.price}৳
                </span>
                {item?.originalPrice && (
                  <span className="text-lg line-through text-brand-gray-base">
                    {item.originalPrice}৳
                  </span>
                )}
              </div>
              {item?.discount && (
                <span className="inline-block bg-brand-orange-light text-brand-orange-base text-xs font-medium px-2 py-0.5 rounded">
                  Save {item.discount}%
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-brand-gray-base">
              {item?.details?.map((detail, idx) => (
                <div key={idx} className="mb-3 flex">
                  <span className="mr-2 text-brand-teal-base">•</span>
                  <p className="flex-1 text-justify whitespace-pre-line">
                    <BoldColonText text={detail} />
                  </p>
                </div>
              ))}
            </div>

            {/* Variant Selection */}
            {item?.variants?.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-medium text-brand-gray-base">
                  Size/Weight
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-2 border rounded-full font-medium transition-colors ${
                        selectedVariant?.weight === variant.weight
                          ? "border-brand-teal-base bg-brand-teal-base text-white"
                          : "border-brand-gray-light bg-white hover:bg-brand-gray-light/20"
                      }`}
                    >
                      {variant.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <h3 className="text-sm font-medium text-brand-gray-base">
                Quantity
              </h3>
              <div className="flex items-center border border-brand-gray-light rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-3 py-1 bg-brand-gray-light/20 hover:bg-brand-gray-light/40 transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-3 py-1 bg-brand-gray-light/20 hover:bg-brand-gray-light/40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddtoCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand-orange-base text-white font-semibold hover:bg-brand-orange-base/90 transition-all duration-200 shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-brand-teal-base text-white font-semibold hover:bg-brand-teal-600 transition-all duration-200 shadow-sm"
              >
                <CreditCard className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-brand-gray-light">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-brand-gray-base">
                  <svg
                    className="w-5 h-5 text-brand-teal-base mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center text-brand-gray-base">
                  <svg
                    className="w-5 h-5 text-brand-teal-base mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    ></path>
                  </svg>
                  <span>Authentic Shipping</span>
                </div>
                <div className="flex items-center text-brand-gray-base">
                  <svg
                    className="w-5 h-5 text-brand-teal-base mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>Same Day Dispatch</span>
                </div>
                <div className="flex items-center text-brand-gray-base">
                  <svg
                    className="w-5 h-5 text-brand-teal-base mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                  </svg>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Sections */}
        <div className="mt-16 space-y-12">
          {/* FAQ Section */}
          {item?.questions?.length > 0 && (
            <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 border border-brand-gray-light">
              <h2 className="text-xl font-bold text-brand-gray-base mb-6">
                Product Information
              </h2>
              <div className="space-y-6">
                {item.questions.map((q, id) => (
                  <div
                    key={id}
                    className="border-b border-brand-gray-light pb-6 last:border-0 last:pb-0"
                  >
                    <h3 className="text-lg font-semibold text-brand-teal-base mb-2">
                      {q.question}
                    </h3>
                    <p className="text-brand-gray-base text-justify whitespace-pre-line">
                      <BoldColonText text={q.ans} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accordion Section */}
          {item?.dropdownQuestions?.length > 0 && (
            <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-brand-gray-light">
              <div className="px-6 py-5 border-b border-brand-gray-light">
                <h2 className="text-xl font-bold text-brand-gray-base">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="divide-y divide-brand-gray-light">
                {item.dropdownQuestions.map((q, id) => (
                  <div key={id} className="group">
                    <button
                      onClick={() => toggle(id)}
                      className="w-full flex justify-between items-center text-left px-6 py-4 text-brand-gray-base hover:bg-brand-gray-light/20 transition-all font-bold"
                    >
                      <span className="text-brand-orange-base">
                        {q.question}
                      </span>
                      {openIndex === id ? (
                        <ChevronUp className="w-5 h-5 text-brand-orange-base" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-brand-orange-base" />
                      )}
                    </button>
                    {openIndex === id && (
                      <div className="px-6 pb-4 text-brand-gray-base text-justify whitespace-pre-line">
                        {q.ans}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="pb-5 mb-2">
          <RelatedProducts category={item.category} currentProductId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
