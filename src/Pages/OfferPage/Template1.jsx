import React from "react";
import Checkout from "../Checkout/Checkout";

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

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <header className="bg-[#386641] text-white pt-5 pb-20 relative">
        <div className="container mx-auto max-w-5xl px-6 lg:px-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Text Content */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#A8DA33] leading-tight">
                {hero.title}
              </h1>
              <p className="mt-4 text-md text-[#EBF0DF] font-semibold">
                {hero.subtitle}
              </p>
              <a
                href="#order-form"
                className="mt-8 inline-block bg-[#A7C957] text-black font-bold py-2 px-6 rounded-md text-lg hover:bg-[#99b64f] transition duration-300"
              >
                অর্ডার করুন
              </a>
            </div>
            {/* Image Content */}
            <div className="w-4/12">
              <img
                src={featuredProduct?.image}
                alt={featuredProduct?.name}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
        <div className="hero-shape-divider">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
              className="shape-fill"
              d="M500,97C126.7,96.3,0.8,19.8,0,0v100l1000,0V1C1000,19.4,873.3,97.8,500,97z"
            ></path>
          </svg>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 lg:px-0 mt-8">
        {/* Features Section */}
        <section className="my-16">
          <h2 className="text-3xl font-bold text-center text-[#386641] mb-12">
            {features.title}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <ul className="space-y-2 text-gray-800">
                {features.list.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <i className="fas fa-check-double text-[#386641] mr-3"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img
                src={features.image}
                alt="Headphone Features"
                className="rounded-lg w-full"
              />
            </div>
          </div>
          <div className="text-center mt-12">
            <a
              href="#order-form"
              className="bg-[#386641] text-white font-bold py-3 px-10 rounded-md text-lg hover:bg-[#2c5233] transition duration-300"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Video and Details Section */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-center text-[#386641] mb-6">
            {video.title}
          </h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-10 text-sm">
            {video.subtitle}
          </p>
          <div className="max-w-3xl mx-auto border-4 border-[#386641] rounded-xl overflow-hidden shadow-lg">
            <div className="video-container">
              <iframe
                src={getYoutubeEmbedUrl(video.url)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="text-center mt-12">
            <a
              href="#order-form"
              className="bg-[#386641] text-white font-bold py-3 px-10 rounded-md text-lg hover:bg-[#2c5233] transition duration-300"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className="my-20">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.images.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Specifications Section */}
        <section className="my-20">
          <h2 className="text-2xl font-bold text-center text-[#386641] mb-10">
            {specifications.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            {specifications.list.map((spec, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center"
              >
                <img
                  src={spec.icon}
                  alt="Icon"
                  className="h-10 w-auto mx-auto mb-2"
                />
                <h3 className="font-semibold text-gray-800 text-sm">
                  {spec.text}
                </h3>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="#order-form"
              className="bg-[#386641] text-white font-bold py-3 px-10 rounded-md text-lg hover:bg-[#2c5233] transition duration-300"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="my-20">
          <h2 className="text-3xl font-bold text-center text-[#386641] mb-10">
            {whyChooseUs.title}
          </h2>
          <div className="space-y-4 text-lg">
            {whyChooseUs.list.map((item, index) => (
              <div key={index} className="flex items-start">
                <i className="fas fa-hand-point-right text-[#386641] text-xl mr-3 mt-1"></i>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="#order-form"
              className="bg-[#386641] text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-[#2c5233] transition duration-300"
            >
              অর্ডার করুন
            </a>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="my-20 bg-gray-100 py-8 px-4 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            {callToAction.title}
          </h2>
          <a
            href={`tel:${callToAction.phone}`}
            className="inline-block bg-yellow-400 text-black font-bold text-xl py-2 px-8 rounded-lg shadow-md hover:bg-yellow-500 transition duration-300"
          >
            <i className="fas fa-phone-alt mr-2"></i> {callToAction.phone}
          </a>
        </section>

        {/* Order Form Section */}
        <section
          id="order-form"
          className="my-20 p-1 border-2 border-[#386641] rounded-xl"
        >
          <div className="bg-gray-50 p-4 rounded-t-lg">
            <h2 className="text-lg font-bold text-center text-[#386641]">
              অর্ডার করতে নিচের ফর্মটি পূরণ করে প্লেস অর্ডার বাটনে ক্লিক করুন!
            </h2>
          </div>
          <div className="p-4">
            <Checkout />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#DADADA] py-4 mt-16">
        <div className="container mx-auto text-center font-montserrat text-xs text-black">
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

export default Template1;
