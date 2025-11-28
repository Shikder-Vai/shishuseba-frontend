import React, { useState, useEffect } from "react";
import Checkout from "../Checkout/Checkout";

const Template2 = ({ landingPageData }) => {
  const {
    noticeBar,
    hero,
    whyChooseUs,
    usage,
    testimonials,
    customerVideos,
    pricing,
    labTest,
    orderInstructions,
    footer,
    featuredProductId,
    featuredProduct,
  } = landingPageData || {};

  const scrollToCheckout = () => {
    document
      .getElementById("checkout-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (featuredProduct && featuredProduct.variants?.length > 0) {
      setSelectedVariant(featuredProduct.variants[0]);
    }
  }, [featuredProduct]);

  useEffect(() => {
    if (featuredProduct && selectedVariant) {
      const price = parseFloat(selectedVariant.price);
      const quantity = 1;

      const cartItem = {
        _id: featuredProduct._id,
        name:
          typeof featuredProduct.name === "object"
            ? featuredProduct.name.en
            : featuredProduct.name,
        image: featuredProduct.image,
        sku: selectedVariant.sku,
        price: price,
        weight: selectedVariant.weight,
        quantity: quantity,
        variants: featuredProduct.variants,
        variant: selectedVariant,
      };

      const cartItems = [cartItem];
      const subtotal = price * quantity;
      const shippingCost = subtotal >= 1000 ? 0 : 80;
      const total = subtotal + shippingCost;

      const newOrder = {
        items: cartItems,
        subtotal,
        shippingCost,
        total,
      };

      setOrder(newOrder);
    }
  }, [featuredProduct, selectedVariant]);

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

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const fullUrl = url.startsWith("http")
        ? url
        : `https://${url.replace(/^\/\//, "")}`;
      const urlObj = new URL(fullUrl);
      const videoId = urlObj.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch (error) {
      console.error("Invalid URL:", error);
      return url;
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800 antialiased">
      {noticeBar?.text && (
        <div
          className="brand-red text-white text-center text-sm md:text-2xl md:font-extrabold py-2 px-4"
          style={{
            backgroundColor: noticeBar.bgColor || "#e11d48",
            color: noticeBar.textColor || "white",
          }}
        >
          {noticeBar.text}
        </div>
      )}

      {hero && (
        <section
          className="brand-light py-8"
          style={{ backgroundColor: hero.bgColor || "#f4fce3" }}
        >
          <div className="max-w-5xl mx-auto px-4">
            {hero.title && (
              <h1
                className="text-center text-xl md:text-2xl font-bold text-green-700 leading-snug"
                style={{ color: hero.titleColor || "#15803d" }}
              >
                {hero.title}
              </h1>
            )}

            <div className="mt-6 grid md:grid-cols-2 gap-6 items-center">
              {hero.videoUrl && (
                <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-gray-200">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={getYoutubeEmbedUrl(hero.videoUrl)}
                      title={hero.title || "Hero Video"}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {hero.subtitle && (
                  <p className="text-sm md:text-base font-medium text-gray-700">
                    {hero.subtitle}
                  </p>
                )}
                {hero.features && hero.features.length > 0 && (
                  <ul className="space-y-1 text-sm md:text-base">
                    {hero.features.map((feature, index) => (
                      <li key={index}>✔️ {feature}</li>
                    ))}
                  </ul>
                )}
                {hero.buttonText && (
                  <button
                    onClick={scrollToCheckout}
                    className="btn-primary mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-md font-semibold shadow-soft"
                    style={{
                      backgroundColor: hero.buttonBgColor || "#16a34a",
                      color: hero.buttonTextColor || "#fff",
                    }}
                  >
                    <span>🛒</span>
                    <span>{hero.buttonText}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {whyChooseUs && (
        <section className="py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            {whyChooseUs.title && (
              <h2
                className="text-center text-lg md:text-xl font-bold mb-4 bg-green-600 text-white inline-block px-4 py-2 rounded"
                style={{
                  backgroundColor: whyChooseUs.titleBgColor || "#16a34a",
                  color: whyChooseUs.titleColor || "white",
                }}
              >
                {whyChooseUs.title}
              </h2>
            )}
            {whyChooseUs.features && whyChooseUs.features.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm md:text-base">
                {whyChooseUs.features.map((feature, index) => (
                  <li key={index}>✔️ {feature}</li>
                ))}
              </ul>
            )}
            {whyChooseUs.buttonText && (
              <div className="text-center mt-4">
                <button
                  onClick={scrollToCheckout}
                  className="px-5 py-2 bg-black text-white rounded font-semibold"
                  style={{
                    backgroundColor: whyChooseUs.buttonBgColor || "black",
                    color: whyChooseUs.buttonTextColor || "white",
                  }}
                >
                  {whyChooseUs.buttonText}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {usage && (
        <section className="py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {usage.title && (
              <h3 className="text-lg md:text-xl font-bold mb-3">
                {usage.title}
              </h3>
            )}
            {usage.description && (
              <p className="text-sm md:text-base max-w-2xl mx-auto">
                {usage.description}
              </p>
            )}
            {usage.buttonText && (
              <button
                onClick={scrollToCheckout}
                className="mt-4 px-5 py-2 bg-black text-white rounded font-semibold"
                style={{
                  backgroundColor: usage.buttonBgColor || "black",
                  color: usage.buttonTextColor || "white",
                }}
              >
                {usage.buttonText}
              </button>
            )}
          </div>
        </section>
      )}

      {testimonials && testimonials.length > 0 && (
        <section className="py-8 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="text-center text-lg md:text-xl font-bold mb-4">
              আমাদের গ্রাহকদের মতামত
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((testimonial, index) => (
                <article
                  key={index}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-sm shadow-soft"
                >
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-full object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <p className="mb-2">{testimonial.text}</p>
                  )}
                  <p className="font-semibold">- {testimonial.author}</p>
                </article>
              ))}
            </div>
            {usage?.buttonText && (
              <div className="text-center mt-4">
                <button
                  onClick={scrollToCheckout}
                  className="px-5 py-2 bg-black text-white rounded font-semibold"
                  style={{
                    backgroundColor: usage.buttonBgColor || "black",
                    color: usage.buttonTextColor || "white",
                  }}
                >
                  {usage.buttonText}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {customerVideos && customerVideos.length > 0 && (
        <section className="py-8 bg-lime-200/70">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="text-center text-lg md:text-xl font-bold mb-4">
              আমাদের সন্তুষ্ট গ্রাহকদের ভিডিও রিভিউ
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {customerVideos.map((video, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-soft h-40"
                >
                  <iframe
                    className="w-full h-full"
                    src={getYoutubeEmbedUrl(video.url)}
                    title={video.title || "Customer Video"}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
            {usage?.buttonText && (
              <div className="text-center mt-4">
                <button
                  onClick={scrollToCheckout}
                  className="px-5 py-2 bg-black text-white rounded font-semibold"
                  style={{
                    backgroundColor: usage.buttonBgColor || "black",
                    color: usage.buttonTextColor || "white",
                  }}
                >
                  {usage.buttonText}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {pricing && (
        <section
          className="brand-green text-white py-6"
          style={{
            backgroundColor: pricing.bgColor || "#15803d",
            color: pricing.textColor || "white",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            {pricing.originalPrice && (
              <p className="text-sm md:text-base">
                তেলের পূর্বের মূল্য {pricing.originalPrice} টাকা
              </p>
            )}
            {pricing.offerPrice && (
              <h3 className="mt-2 text-2xl md:text-3xl font-extrabold">
                অফার মূল্য:{" "}
                <span
                  className="text-yellow-300"
                  style={{ color: pricing.offerPriceColor || "#fbbf24" }}
                >
                  {pricing.offerPrice} টাকা
                </span>
              </h3>
            )}
            {pricing.subtitle && (
              <p className="mt-1 text-xs md:text-sm">{pricing.subtitle}</p>
            )}
            {pricing.buttonText && (
              <button
                onClick={scrollToCheckout}
                className="mt-4 px-6 py-2 bg-black text-white rounded font-semibold"
                style={{
                  backgroundColor: pricing.buttonBgColor || "black",
                  color: pricing.buttonTextColor || "white",
                }}
              >
                {pricing.buttonText}
              </button>
            )}
          </div>
        </section>
      )}

      {labTest && (
        <section className="py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {labTest.title && (
              <h3 className="text-lg md:text-xl font-bold mb-2">
                {labTest.title}
              </h3>
            )}
            {labTest.subtitle && (
              <p className="text-xs md:text-sm mb-4 max-w-2xl mx-auto">
                {labTest.subtitle}
              </p>
            )}
            {labTest.image && (
              <img
                src={labTest.image}
                alt="Lab Test Certificate"
                className="border-2 border-green-500 rounded-2xl"
              />
            )}
          </div>
        </section>
      )}

      {orderInstructions?.text && (
        <section className="py-6 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm md:text-base">
            <p dangerouslySetInnerHTML={{ __html: orderInstructions.text }} />
          </div>
        </section>
      )}

      {/* ✅ Template1 এর মতো Checkout Section + Data pass */}
      <section id="checkout-section" className="my-12 sm:my-16 p-1">
        <div className="bg-pink-500 p-4 sm:p-5 rounded-t-2xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-extrabold text-white text-center">
            অর্ডার করতে নিচের ফর্মটি পূরণ করে প্লেস অর্ডার বাটনে ক্লিক করুন!
          </h2>
        </div>
        <div className="p-5 sm:p-6 bg-white rounded-b-2xl shadow-2xl border border-gray-100">
          {featuredProduct ? (
            <Checkout
              order={order}
              onQuantityChange={handleQuantityChange}
              onVariantChange={handleVariantChange}
            />
          ) : (
            // fallback – আগের আচরণ রাখতে চাইলে
            <Checkout
              landingPage={true}
              featuredProductId={featuredProductId}
            />
          )}
        </div>
      </section>

      {footer?.text && (
        <footer
          className="brand-green text-white text-center text-xs py-4"
          style={{
            backgroundColor: footer.bgColor || "#15803d",
            color: footer.textColor || "white",
          }}
        >
          <p>{footer.text}</p>
        </footer>
      )}
    </div>
  );
};

export default Template2;
