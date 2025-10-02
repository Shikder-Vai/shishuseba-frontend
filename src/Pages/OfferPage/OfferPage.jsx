import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Star, ShieldCheck, Truck, Award } from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import SectionTitle from "../../components/SectionTitle";
import useScrollToTop from "../../hooks/useScrollToTop";

const OfferPage = () => {
  useScrollToTop();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["landingPageContent"],
    queryFn: async () => {
      const res = await axiosPublic.get("/v1/landing-page");
      return res.data;
    },
  });

  const handleBuyNow = () => {
    if (!data || !data.featuredProduct) return;

    const product = data.featuredProduct;
    const cartItem = {
      ...product,
      quantity: 1, // Default quantity is 1
    };

    const subtotal = parseFloat(
      product.variants[0]?.price || product.price || 0
    );
    const shippingCost = subtotal >= 1000 ? 0 : 80; // Same logic as cart
    const total = subtotal + shippingCost;

    const order = {
      items: [cartItem],
      subtotal,
      shippingCost,
      total,
    };

    localStorage.setItem("order", JSON.stringify(order));
    navigate("/checkout");
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Content Not Available
        </h2>
        <p className="text-gray-600">
          The offer page content has not been set up by the administrator yet.
        </p>
        <p className="text-gray-500 text-sm mt-1">Please check back later.</p>
      </div>
    );
  }

  const { hero, sections, featuredProduct } = data;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-brand-cream pt-20 pb-10 md:pt-32 md:pb-20 text-center overflow-hidden"
      >
        <div className="container mx-auto px-4 z-10 relative">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-brand-teal-base mb-4"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-2xl mx-auto text-base md:text-lg text-brand-gray-base mb-8"
          >
            {hero.subtitle}
          </motion.p>
          {hero.image && (
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              src={hero.image}
              alt={hero.title}
              className="max-w-md mx-auto rounded-lg shadow-2xl"
            />
          )}
        </div>
      </motion.section>

      {/* Featured Product Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {featuredProduct.name}
            </h2>
            <p className="text-gray-600 mb-6">
              {featuredProduct.details?.join(" ")}
            </p>
            <div className="text-4xl font-bold text-brand-teal-base mb-8">
              ৳{featuredProduct.variants[0]?.price || featuredProduct.price}
            </div>
            <button
              onClick={handleBuyNow}
              className="w-full py-4 px-8 bg-brand-orange-base text-white font-bold rounded-lg shadow-lg hover:bg-brand-orange-dark transition-transform transform hover:scale-105"
            >
              Order Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Content Sections */}
      <div className="space-y-16 py-16 bg-gray-50">
        {sections.map((section, index) => (
          <motion.section
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center"
          >
            <div className={`md:order-${index % 2 === 0 ? 1 : 2}`}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {section.title}
              </h3>
              <p className="text-gray-600">{section.text}</p>
            </div>
            <div className={`md:order-${index % 2 === 0 ? 2 : 1}`}>
              <img
                src={section.image}
                alt={section.title}
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </div>
          </motion.section>
        ))}
      </div>

      {/* Reviews Section */}
      {featuredProduct.reviews && featuredProduct.reviews.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <SectionTitle title="What Our Customers Say" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {featuredProduct.reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-50 p-6 rounded-lg shadow-sm border"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} fill="currentColor" size={20} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "{review.comment}"
                  </p>
                  <p className="font-semibold text-gray-800">
                    - {review.customerName}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default OfferPage;
