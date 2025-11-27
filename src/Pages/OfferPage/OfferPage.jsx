import Template1 from "./Template1";
import Template2 from "./Template2";
import Template3 from "./Template3";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import Checkout from "../Checkout/Checkout";
import "./OfferPage.css";
import { pushPageView, pushViewItem } from "../../services/DataLayerService";

import { ArrowBigRight, ShieldCheck } from "lucide-react";

const OfferPage = () => {
  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const location = useLocation();
  const hasFiredPageView = useRef(false);
  const hasFiredViewItem = useRef(false);
  const [order, setOrder] = useState(null);

  const {
    data: landingPageData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["landingPage", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/landing-pages/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (landingPageData && landingPageData.featuredProduct && landingPageData.featuredProduct.variants && landingPageData.featuredProduct.variants.length > 0) {
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
        name: typeof featuredProduct.name === 'object' ? featuredProduct.name.en : featuredProduct.name,
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

  useEffect(() => {
    if (!hasFiredPageView.current) {
      pushPageView(location.pathname, document.title, "landing_page_view");
      hasFiredPageView.current = true;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (landingPageData && selectedVariant && !hasFiredViewItem.current) {
      const productWithPrice = {
        ...landingPageData.featuredProduct,
        price: selectedVariant.price,
      };
      pushViewItem(productWithPrice);
      hasFiredViewItem.current = true;
    }
  }, [landingPageData, selectedVariant]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !landingPageData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500">
          Could Not Load Page Content
        </h2>
        <p>{error?.message || "Data not available."}</p>
        <p>
          Please ensure you have set the landing page content from the admin
          dashboard.
        </p>
      </div>
    );
  }

  if (landingPageData?.templateId === "template1") {
    return <Template1 landingPageData={landingPageData} />;
  } else if (landingPageData?.templateId === "template2") {
    return <Template2 landingPageData={landingPageData} />;
  } else if (landingPageData?.templateId === "template3") {
    return <Template3 landingPageData={landingPageData} />;
  }

  const {
    hero = { title: "", subtitle: "" },
    featuredProduct,
    problemSection = { title: "", problems: [] },
    ingredientsSection = { title: "", ingredients: [] },
    benefitsSection = { title: "", image: "", benefits: [] },
    footer = { phoneNumber: "" },
  } = landingPageData;

  return (
    <div className="offer-page">
      <main>
        {/* ========== HERO SECTION ========== */}
        <section id="hero">
          <div className="offer-page-container">
            <div className="hero-content">
              <h1>{hero.title}</h1>
              <p>{hero.subtitle}</p>
              <a href="#order-form" className="cta-button">
                এখনি অর্ডার করুন
              </a>
            </div>
            <div>
              <img
                src={featuredProduct?.image}
                alt={typeof featuredProduct?.name === 'object' ? featuredProduct?.name.en : featuredProduct?.name}
                className="product-image"
              />
              <h3 className="text-2xl font-bold text-center mt-[-10px]">
                {typeof featuredProduct?.name === 'object' ? featuredProduct?.name.en : featuredProduct?.name}
              </h3>
            </div>
          </div>
          <div className="wave-divider">
            <svg
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                className="shape-fill"
              ></path>
            </svg>
          </div>
        </section>

        {/* The rest of the sections remain the same... */}
        <section id="problem">
          <div className="offer-page-container">
            <h2 className="section-title">{problemSection.title}</h2>
            <div className="problem-grid">
              {problemSection.problems.map((problem, index) => (
                <div className="problem-item" key={index}>
                  <div className="icon">
                    <ArrowBigRight size={22} />
                  </div>
                  <span>{problem.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ingredients">
          <div className="offer-page-container">
            <h2 className="section-title">{ingredientsSection.title}</h2>
            <div className="ingredients-grid">
              {ingredientsSection.ingredients.map((ingredient, index) => (
                <div className="ingredient-item" key={index}>
                  <img src={ingredient.image} alt={ingredient.name} />
                  <span>{ingredient.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full flex justify-center items-center mt-10">
            <a href="#order-form" className="cta-button">
              এখনি অর্ডার করুন
            </a>
          </div>
        </section>

        <section id="benefits">
          <div className="offer-page-container">
            <div className="benefits-content">
              <img
                src={benefitsSection.image}
                alt="Happy Baby"
                className="benefits-image"
              />
              <div>
                <h2
                  className="section-title"
                  style={{ textAlign: "left", marginBottom: "25px" }}
                >
                  {benefitsSection.title}
                </h2>
                <ul className="benefits-list">
                  {benefitsSection.benefits.map((benefit, index) => (
                    <li key={index}>
                      <div className="icon">
                        <ShieldCheck size={22} />
                      </div>
                      {benefit.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="order-form">
          <div className="offer-page-container">
            <div className="variant-selection-checkout">
              <div className="flex flex-col">
                <img
                  src={featuredProduct?.image}
                  alt={typeof featuredProduct?.name === 'object' ? featuredProduct?.name.en : featuredProduct?.name}
                  className="max-w-60 mb-2 transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer rounded"
                />
                <span
                  className="text-2xl text-brand-teal-base font-bold text-center 
                  transition-transform duration-300 ease-in-out
                  hover:scale-105 cursor-pointer"
                >
                  {typeof featuredProduct?.name === 'object' ? featuredProduct?.name.en : featuredProduct?.name}
                </span>
              </div>
              <span className="text-2xl text-brand-orange-base text-center font-bold">
                Select Product Variant
              </span>
              <div className="variant-options">
                {featuredProduct?.variants.map((variant) => (
                  <label key={variant.weight} className="variant-label">
                    <input
                      type="radio"
                      name="variant"
                      value={variant.weight}
                      checked={selectedVariant?.weight === variant.weight}
                      onChange={() => setSelectedVariant(variant)}
                    />
                    <span>{variant.weight}</span>
                  </label>
                ))}
              </div>
              {selectedVariant && (
                <div className="variant-price">
                  Price: <span>{selectedVariant.price}৳</span>
                </div>
              )}
            </div>
            <Checkout
              order={order}
              onQuantityChange={handleQuantityChange}
              onVariantChange={handleVariantChange}
            />
          </div>
        </section>
      </main>

      <footer className="offer-page-footer">
        <div className="offer-page-container">
          <h3 className="text-3xl font-semibold">শিশুসেবা</h3>
          <p>আপনার সোনামণির জন্য আমাদের ভালোবাসা ও যত্ন</p>
          <p>
            যেকোনো প্রয়োজনে কল করুন:{" "}
            <a href={`tel:${footer.phoneNumber}`}>
              <strong>{footer.phoneNumber}</strong>
            </a>
          </p>
          <p>
            &copy; {new Date().getFullYear()} Shishuseba.com. All Rights
            Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OfferPage;

