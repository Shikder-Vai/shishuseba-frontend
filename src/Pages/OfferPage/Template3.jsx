import React, { useState, useEffect } from 'react';
import Checkout from '../Checkout/Checkout'; // Assuming path is correct

const Template3 = ({ landingPageData }) => {
  // Default values to prevent errors if landingPageData is not fully populated
  const {
    headerTitle,
    headerSubtitle,
    productImage,
    orderButtonText = "এখনই অর্ডার করুন",
    benefitsTitle,
    benefits,
    certificateTitle,
    certificateImage,
    previousPriceText,
    previousPrice,
    offerPriceText,
    offerPrice,
    cartButtonText = "এখনই অর্ডার করুন",
    testimonialsTitle,
    videoUrl,
    footerPhoneNumbers,
    footerCopyright,
    featuredProduct,
  } = landingPageData || {};

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (featuredProduct && featuredProduct.variants && featuredProduct.variants.length > 0) {
      setSelectedVariant(featuredProduct.variants[0]);
    }
  }, [featuredProduct]);

  useEffect(() => {
    if (featuredProduct && selectedVariant) {
      const orderItem = {
        _id: featuredProduct._id,
        name: typeof featuredProduct.name === 'object' ? featuredProduct.name.en : featuredProduct.name,
        image: featuredProduct.image,
        variants: featuredProduct.variants,
        price: selectedVariant.price,
        weight: selectedVariant.weight,
        variant: selectedVariant,
        quantity: quantity,
      };
      setOrder({
        items: [orderItem],
        subtotal: selectedVariant.price * quantity,
      });
    }
  }, [featuredProduct, selectedVariant, quantity]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleVariantChange = (itemId, newWeight) => {
    const newVariant = featuredProduct.variants.find(v => v.weight === newWeight);
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };
  
  const scrollToCheckout = () => {
    const checkoutElement = document.getElementById('checkout-section');
    if (checkoutElement) {
      checkoutElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasBenefits = benefits && benefits.length > 0 && benefits.some(item => item.trim() !== '');

  return (
    <div className="antialiased text-gray-800">
      {/* Top banner */}
      {(headerTitle || headerSubtitle) && (
        <header className="brand-green text-white py-6" style={{ backgroundColor: '#0b5b2b' }}>
          <div className="max-w-3xl mx-auto text-center px-4">
            {headerTitle && <h1 className="text-2xl md:text-3xl font-bold">{headerTitle}</h1>}
            {headerSubtitle && <p className="mt-2 text-sm opacity-90">{headerSubtitle}</p>}
          </div>
        </header>
      )}

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Hero product card */}
        {productImage && (
          <section className="text-center">
            <div className="mx-auto w-64 md:w-80 rounded-2xl overflow-hidden border border-gray-200 bg-white" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
              <img src={productImage} alt="Product" className="w-full object-cover" />
            </div>
            <div className="mt-4">
              <button onClick={scrollToCheckout} className="btn-primary px-5 py-3 rounded-md font-semibold shadow" style={{ backgroundColor: '#f97316', color: 'white' }}>
                {orderButtonText}
              </button>
            </div>
          </section>
        )}

        {/* Features box */}
        {hasBenefits && (
          <section className="border border-green-800 rounded-lg p-4 bg-emerald-50">
            {benefitsTitle && <h2 className="text-green-900 font-bold text-lg mb-3">{benefitsTitle}</h2>}
            <ul className="list-none space-y-2 text-sm text-green-800">
              {benefits.map((item, index) => (
                item.trim() && <li key={index}>✔️ {item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Certificate */}
        {certificateImage && (
          <section className="text-center">
            {certificateTitle && <h3 className="font-semibold text-green-900">{certificateTitle}</h3>}
            <div className="mx-auto mt-3 w-64 md:w-80 border border-gray-200 rounded-lg overflow-hidden">
              <img src={certificateImage} alt="certificate" className="w-full object-cover opacity-90" />
            </div>
          </section>
        )}

        {/* Pricing strip */}
        {(offerPrice || previousPrice) && (
          <section className="brand-green text-white rounded-xl py-6 text-center relative" style={{ backgroundColor: '#0b5b2b' }}>
            <div className="max-w-xl mx-auto">
              {previousPrice && (
                <p className="text-base mb-1 font-medium">
                  {previousPriceText}
                  <span className="relative inline-block ml-1">
                    <span className="text-white text-lg line-through">৳ {previousPrice}</span>
                  </span>
                </p>
              )}
              {offerPrice && (
                <h4 className="text-2xl md:text-3xl font-extrabold mt-1 leading-tight">
                  <span className="text-white mr-1">{offerPriceText}</span>
                  <span className="text-yellow-300">{offerPrice}</span>
                </h4>
              )}
              <div className="mt-4">
                <button onClick={scrollToCheckout} className="btn-primary px-5 py-2 rounded-md font-semibold text-base shadow inline-flex items-center gap-2" style={{ backgroundColor: '#f97316', color: 'white' }}>
                  <span className="text-lg">🛒</span>
                  <span>{cartButtonText}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials / Video placeholder */}
        {videoUrl && (
          <section>
            {testimonialsTitle && <h4 className="text-center font-semibold text-green-900">{testimonialsTitle}</h4>}
            <div className="mt-3 bg-black h-48 md:h-64 rounded-lg shadow">
              <iframe
                width="100%"
                height="100%"
                src={videoUrl.replace("watch?v=", "embed/")}
                title="Testimonial Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </section>
        )}

        {/* Checkout Section */}
        <section id="checkout-section">
          {order && (
            <Checkout
              order={order}
              onQuantityChange={handleQuantityChange}
              onVariantChange={handleVariantChange}
            />
          )}
        </section>

      </main>

      <footer className="brand-green text-white mt-8 py-6" style={{ backgroundColor: '#0b5b2b' }}>
        <div className="max-w-3xl mx-auto text-center text-sm">
          {footerPhoneNumbers && <p>কিনতে ফোন করুন: {footerPhoneNumbers}</p>}
          {footerCopyright && <p className="mt-2 opacity-80">{footerCopyright}</p>}
        </div>
      </footer>
    </div>
  );
};

export default Template3;
