import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import Checkout from "../Checkout/Checkout";
import "./OfferPage.css";

import { ShoppingCart, Check, ArrowBigRight, ShieldCheck } from "lucide-react";

const OfferPage = () => {
  const axiosPublic = useAxiosPublic();

  const {
    data: landingPageData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["landingPage"],
    queryFn: async () => {
      const res = await axiosPublic.get("/landing-page");
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    // On component mount, save the user's original cart.
    const originalCart = localStorage.getItem("cart");
    const originalOrder = localStorage.getItem("order");

    // Return a cleanup function to run when the component unmounts.
    return () => {
      // When the user navigates away, restore their original cart.
      if (originalCart) {
        localStorage.setItem("cart", originalCart);
      } else {
        localStorage.removeItem("cart");
      }
      if (originalOrder) {
        localStorage.setItem("order", originalOrder);
      } else {
        localStorage.removeItem("order");
      }
      // Notify other components that the cart has been restored.
      window.dispatchEvent(new Event("cart-updated"));
    };
  }, []); // Empty dependency array ensures this runs only once on mount and unmount.

  // This separate effect handles updating the cart when the landing page data loads.
  useEffect(() => {
    if (landingPageData && landingPageData.featuredProduct) {
      const { featuredProduct } = landingPageData;

      const variant = featuredProduct.variants[0];
      if (!variant) return;

      const price = parseFloat(variant.price);
      const quantity = 1;

      const cartItem = {
        ...featuredProduct,
        variant,
        price,
        weight: variant.weight,
        admin_note: "",
        quantity: quantity,
      };

      const cartItems = [cartItem];
      const subtotal = price * quantity;
      const shippingCost = subtotal >= 1000 ? 0 : 80;
      const total = subtotal + shippingCost;

      const order = {
        items: cartItems,
        subtotal,
        shippingCost,
        total,
      };

      // Overwrite localStorage for the Checkout component.
      localStorage.setItem("cart", JSON.stringify(cartItems));
      localStorage.setItem("order", JSON.stringify(order));
      window.dispatchEvent(new Event("cart-updated"));
    }
  }, [landingPageData]);

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
      <header className="offer-page-header">
        <div className="offer-page-container">Shishuseba</div>
      </header>

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
                alt={featuredProduct?.name}
                className="product-image"
              />
              {/* Display the product name */}
              <h3 className="text-2xl font-bold text-center mt-[-10px]">
                {featuredProduct?.name}
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
            <Checkout />
          </div>
        </section>
      </main>

      <footer className="offer-page-footer">
        <div className="offer-page-container">
          <h3>Shishuseba</h3>
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

      {/* <div className="sticky-footer-cta">
        <a href="#order-form" className="cta-button">
          <ShoppingCart size={20} style={{ marginRight: "10px" }} /> এখনি অর্ডার
          করুন
        </a>
      </div> */}
    </div>
  );
};

export default OfferPage;
