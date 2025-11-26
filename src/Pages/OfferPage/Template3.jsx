import React, { useState, useEffect } from 'react';
import Checkout from '../Checkout/Checkout'; // Assuming path is correct

const Template3 = ({ landingPageData }) => {
  // Default values to prevent errors if landingPageData is not fully populated
  const {
    headerTitle = "আপনার শিশির ঠান্ডা, সর্দি-কাশি, কফ ও শ্বাসকষ্ট দূর করুন প্রাকৃতিকভাবে।",
    headerSubtitle = "দৈনন্দিন ব্যবহার-অ্যালার্জির জন্যই কল্পিত শিশুর শ্বাসকষ্ট থেকে রক্ষা।",
    productImage = "/mnt/data/herbheez.xyz_.png", // Placeholder
    orderButtonText = "এখনই অর্ডার করুন",
    benefitsTitle = "Barid Shifa Oil এর উপকারিতা:",
    benefits = [
      "ঠান্ডা, সর্দি-কাশি ও শ্বাসকষ্ট থেকে দ্রুত এড়ায়।",
      "শিশুর নাক খুলে দেয় ও শ্বাস-প্রশ্বাসে স্বস্তি দেয়।",
      "সম্পূর্ণ প্রাকৃতিক উপাদান।",
      "ক্লিনিক্যাল টেস্টেড এবং নিরাপদ।"
    ],
    certificateTitle = "পরীক্ষিত ল্যাব-টেস্ট রির্পোট",
    certificateImage = "/mnt/data/herbheez.xyz_.png", // Placeholder
    previousPriceText = "ডেলিভারির পূর্বের মূল্য",
    previousPrice = "1699",
    offerPriceText = "অফার মূল্য",
    offerPrice = "990 টাকা",
    cartButtonText = "এখনই অর্ডার করুন",
    testimonialsTitle = "১৮০০০+ সন্তুষ্ট সমর্থিত গ্রাহকের মতামত",
    videoUrl = "", // Placeholder for YouTube or other video embed URL
    footerPhoneNumbers = "01604-939479, 01917-969696",
    footerCopyright = "© 2025 Herbheez. All rights reserved.",
    featuredProduct, // This will be passed from landingPageData
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

  return (
    <div className="antialiased text-gray-800">
      {/* Top banner */}
      <header className="brand-green text-white py-6" style={{ backgroundColor: '#0b5b2b' }}>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-2xl md:text-3xl font-bold">{headerTitle}</h1>
          <p className="mt-2 text-sm opacity-90">{headerSubtitle}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Hero product card */}
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

        {/* Features box */}
        <section className="border border-green-800 rounded-lg p-4 bg-emerald-50">
          <h2 className="text-green-900 font-bold text-lg mb-3">{benefitsTitle}</h2>
          <ul className="list-none space-y-2 text-sm text-green-800">
            {benefits.map((item, index) => (
              <li key={index}>✔️ {item}</li>
            ))}
          </ul>
        </section>

        {/* Certificate */}
        <section className="text-center">
          <h3 className="font-semibold text-green-900">{certificateTitle}</h3>
          <div className="mx-auto mt-3 w-64 md:w-80 border border-gray-200 rounded-lg overflow-hidden">
            <img src={certificateImage} alt="certificate" className="w-full object-cover opacity-90" />
          </div>
        </section>

        {/* Pricing strip */}
        <section className="brand-green text-white rounded-xl py-6 text-center relative" style={{ backgroundColor: '#0b5b2b' }}>
          <div className="max-w-xl mx-auto">
            <p className="text-base mb-1 font-medium">
              {previousPriceText}
              <span className="relative inline-block ml-1">
                <span className="text-white text-lg line-through">৳ {previousPrice}</span>
              </span>
            </p>
            <h4 className="text-2xl md:text-3xl font-extrabold mt-1 leading-tight">
              <span className="text-white mr-1">{offerPriceText}</span>
              <span className="text-yellow-300">{offerPrice}</span>
            </h4>
            <div className="mt-4">
              <button onClick={scrollToCheckout} className="btn-primary px-5 py-2 rounded-md font-semibold text-base shadow inline-flex items-center gap-2" style={{ backgroundColor: '#f97316', color: 'white' }}>
                <span className="text-lg">🛒</span>
                <span>{cartButtonText}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials / Video placeholder */}
        <section>
          <h4 className="text-center font-semibold text-green-900">{testimonialsTitle}</h4>
          <div className="mt-3 bg-black h-48 md:h-64 rounded-lg shadow">
            {videoUrl && (
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
            )}
          </div>
        </section>

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
          <p>কিনতে ফোন করুন: {footerPhoneNumbers}</p>
          <p className="mt-2 opacity-80">{footerCopyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default Template3;
