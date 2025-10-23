import { useState, useEffect } from "react";
import Checkout from "../Checkout/Checkout";

// Note: Ensure your global CSS or Tailwind config supports the new custom colors and the 'video-container' for responsive iframe.

const Template1 = ({ landingPageData }) => {
  const {
    featuredProduct,
    hero = { title: "", subtitle: "", image: "" },
    features = { title: "", list: [], image: "" },
    video = { title: "", subtitle: "", url: "" },
    gallery = { images: [] },
    specifications = { title: "", list: [] },
    whyChooseUs = { title: "", list: [] },
    callToAction = { title: "", phone: "" },
    footer = { phoneNumber: "" },
  } = landingPageData;

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [order, setOrder] = useState(null);

  // --- [Data Handling & Logic Remains Unchanged] ---

  useEffect(() => {
    if (landingPageData && landingPageData.featuredProduct) {
      setSelectedVariant(landingPageData.featuredProduct.variants[0]);
    }
  }, [landingPageData]);

  useEffect(() => {
    if (landingPageData && landingPageData.featuredProduct && selectedVariant) {
      const { featuredProduct } = landingPageData;

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
  }, [landingPageData, selectedVariant]);

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
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return url;
    }
  };

  // --- [Start of JSX with Product Name Addition in Hero] ---

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      {/* Hero Section */}
      <header className="bg-indigo-800 text-white pt-10 pb-28 md:pb-32 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl px-6 lg:px-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <div className="md:w-1/2 text-center md:text-left order-2 md:order-1">
              <h1 className="text-4xl sm:text-4xl lg:text-5xl font-extrabold text-yellow-300 leading-tight tracking-tight">
                {hero.title}
              </h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-indigo-100 font-light max-w-lg mx-auto md:mx-0 opacity-90">
                {hero.subtitle}
              </p>
              <a
                href="#order-form"
                className="mt-6 sm:mt-8 inline-block bg-pink-500 text-white font-extrabold py-3 px-8 sm:py-4 sm:px-10 rounded-xl text-lg sm:text-xl shadow-2xl shadow-pink-500/50 hover:bg-pink-600 transition duration-300 transform hover:scale-105"
              >
                অর্ডার করুন
              </a>
            </div>

            {/* Image Content - With Product Name Added */}
            <div className="w-full md:w-5/12 p-3 sm:p-4 bg-white/10 rounded-xl sm:rounded-2xl shadow-2xl order-1 md:order-2 text-center">
              <img
                src={featuredProduct?.image}
                alt={
                  typeof featuredProduct?.name === "object"
                    ? featuredProduct?.name.en
                    : featuredProduct?.name
                }
                className="w-full h-auto rounded-lg"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 bg-indigo-900/50 p-2 rounded-lg mt-3">
                {typeof featuredProduct?.name === "object"
                  ? featuredProduct?.name.en
                  : featuredProduct?.name}
              </h2>
            </div>
          </div>
        </div>
        {/* Shape Divider */}
        <div className="hero-shape-divider">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
              className="shape-fill fill-gray-50"
              d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"
            ></path>
          </svg>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 lg:px-0 pt-8">
        {/* Features Section */}
        <section className="my-12 sm:my-16">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 border-b-4 border-pink-500 inline-block pb-2">
              {features.title}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <ul className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg">
                {features.list.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-pink-500 text-xl sm:text-2xl mr-3 mt-1 flex-shrink-0"></i>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 p-2 sm:p-4">
              <img
                src={features.image}
                alt="Product Features"
                className="rounded-xl w-full shadow-xl"
              />
            </div>
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <a
              href="#order-form"
              className="bg-indigo-700 text-white font-extrabold py-3 px-10 rounded-lg text-lg sm:text-xl hover:bg-indigo-800 transition duration-300 shadow-md"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Video and Details Section */}
        <section className="my-12 sm:my-16">
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 border-b-4 border-pink-500 inline-block pb-2">
              {video.title}
            </h2>
          </div>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 text-sm sm:text-md">
            {video.subtitle}
          </p>
          <div className="max-w-3xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            <div className="video-container">
              <iframe
                src={getYoutubeEmbedUrl(video.url)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <a
              href="#order-form"
              className="bg-indigo-700 text-white font-extrabold py-3 px-10 rounded-lg text-lg sm:text-xl hover:bg-indigo-800 transition duration-300 shadow-md"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className="my-10 sm:my-12">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {gallery.images.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-500"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Specifications Section */}
        <section className="my-12 sm:my-16">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 border-b-4 border-pink-500 inline-block pb-2">
              {specifications.title}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            {specifications.list.map((spec, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition duration-300 border border-gray-100"
              >
                <img
                  src={spec.icon}
                  alt="Icon"
                  className="h-10 w-auto sm:h-12 mx-auto mb-2 sm:mb-3"
                />
                <h3 className="font-bold text-indigo-800 text-sm sm:text-lg">
                  {spec.text}
                </h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <a
              href="#order-form"
              className="bg-indigo-700 text-white font-extrabold py-3 px-10 rounded-lg text-lg sm:text-xl hover:bg-indigo-800 transition duration-300 shadow-md"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="my-12 sm:my-16 bg-white p-6 sm:p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-900 border-b-4 border-pink-500 inline-block pb-2">
              {whyChooseUs.title}
            </h2>
          </div>
          <div className="space-y-4 sm:space-y-6 text-base sm:text-xl">
            {whyChooseUs.list.map((item, index) => (
              <div key={index} className="flex items-start">
                <i className="fas fa-hand-point-right text-pink-500 text-xl sm:text-2xl mr-3 sm:mr-4 mt-1 flex-shrink-0"></i>
                <p className="text-gray-700 font-medium">{item}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <a
              href="#order-form"
              className="bg-pink-500 text-white font-extrabold py-3 px-8 rounded-lg text-lg sm:text-xl hover:bg-pink-600 transition duration-300 shadow-xl"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Call to Action Section*/}
        <section className="my-12 sm:my-16 bg-indigo-700 py-8 sm:py-10 px-4 rounded-xl text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-5 sm:mb-6">
            {callToAction.title}
          </h2>
          <a
            href={`tel:${callToAction.phone}`}
            className="inline-block bg-yellow-300 text-indigo-900 font-extrabold text-xl sm:text-2xl py-3 px-8 sm:px-10 rounded-xl shadow-lg hover:bg-yellow-400 transition duration-300 transform hover:scale-105"
          >
            <i className="fas fa-phone-alt mr-3"></i> {callToAction.phone}
          </a>
        </section>

        {/* Order Form Section */}
        <section id="order-form" className="my-12 sm:my-16 p-1">
          <div className="bg-pink-500 p-4 sm:p-5 rounded-t-2xl shadow-lg">
            <h2 className="text-lg sm:text-xl font-extrabold text-white text-center">
              অর্ডার করতে নিচের ফর্মটি পূরণ করে প্লেস অর্ডার বাটনে ক্লিক করুন!
            </h2>
          </div>
          <div className="p-5 sm:p-6 bg-white rounded-b-2xl shadow-2xl border border-gray-100">
            <Checkout
              order={order}
              onQuantityChange={handleQuantityChange}
              onVariantChange={handleVariantChange}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-900 py-5 sm:py-6 mt-4 text-white">
        <div className="container mx-auto text-center font-sans text-md px-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-pink-500">
            শিশুসেবা
          </h3>
          <p className="text-indigo-200 mt-1">
            আপনার সোনামণির জন্য আমাদের ভালোবাসা ও যত্ন
          </p>
          <p></p>
          <p className="mt-4 text-base sm:text-lg">
            যেকোনো প্রয়োজনে কল করুন:{" "}
            <a href={`tel:${footer.phoneNumber}`}>
              <strong className="text-yellow-300 text-lg sm:text-xl hover:text-yellow-400 transition duration-300">
                {footer.phoneNumber}
              </strong>
            </a>
          </p>
          <p className="text-xs text-indigo-400 mt-2">
            &copy; {new Date().getFullYear()} Shishuseba.com. All Rights
            Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Template1;
