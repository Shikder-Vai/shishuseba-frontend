import { MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import team from "../../assets/About/team.jpg";
import map from "../../assets/About/map.png";
import useScrollToTop from "../../hooks/useScrollToTop";
import SectionTitle from "../../components/SectionTitle";

const AboutUs = () => {
  useScrollToTop();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <SectionTitle title="Our Story" />
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-lg md:text-xl text-brand-gray-base leading-relaxed">
            "Our journey began while searching for safe and healthy food for my own child"
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base leading-relaxed">
            When doubts arose about the safety and nutrition of store-bought baby food, we took a new path — ensuring proper nourishment with homemade ingredients.
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base leading-relaxed">
            What began as a mother's care has now become a trusted name for hundreds of families.
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base leading-relaxed">
            From this belief, "Shishu Seba" was born — a brand where every meal is crafted with love, care, and scientifically guided nutrition.
          </p>
        </div>
      </section>

      

      {/* About Content */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
          <img
            src={team}
            alt="Our team working together"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-brand-teal-500">Who We Are</h2>
          <div className="space-y-4 text-brand-gray-base">
            <p>
              🌟 Founded: In 2024, during a time of national transition
            </p>
            <p>
              We began as a small team with a big vision — to create products that combine quality, sustainability, and exceptional design.
            </p>
            <p>
              Today, that vision has grown into a trusted brand, serving customers across the region with care and confidence.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-brand-teal-100 p-2 rounded-full mt-1 flex-shrink-0">
                <ChevronRight className="text-brand-teal-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-teal-500">✅ Quality First</h3>
                <p className="text-brand-gray-base">
                  Every product undergoes rigorous testing to ensure it meets our high standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-brand-teal-100 p-2 rounded-full mt-1 flex-shrink-0">
                <ChevronRight className="text-brand-teal-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-teal-500">🌱 Sustainable Production</h3>
                <p className="text-brand-gray-base">
                  We are committed to eco-friendly manufacturing and packaging — for a better future and a healthier planet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-brand-teal-100 p-2 rounded-full mt-1 flex-shrink-0">
                <ChevronRight className="text-brand-teal-500 w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-teal-500">🤝 Customer-Centered</h3>
                <p className="text-brand-gray-base">
                  Your satisfaction is the driving force behind everything we do.
                </p>
              </div>
            </div>
          </div>

          <a 
            href="https://wa.me/8801957810247" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <button className="bg-brand-orange-base hover:bg-brand-orange-dark text-white px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Meet Our Team
            </button>
          </a>
        </div>
      </section>
{/* Commitment Section */}
      <section className="text-center space-y-8">
        <SectionTitle title="Our Commitment" />
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-lg md:text-xl text-brand-gray-base flex items-center justify-center gap-2">
            <span className="inline-block w-6 text-center">✅</span> Made with 100% natural ingredients
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base flex items-center justify-center gap-2">
            <span className="inline-block w-6 text-center">❌</span> Free from preservatives, artificial colors, or flavors
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base flex items-center justify-center gap-2">
            <span className="inline-block w-6 text-center">👩‍⚕</span> Developed with expert nutritionist guidance
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base flex items-center justify-center gap-2">
            <span className="inline-block w-6 text-center">🧪</span> Lab-tested and produced following HACCP & BSTI certified standards
          </p>
          <p className="text-lg md:text-xl text-brand-gray-base flex items-center justify-center gap-2">
            <span className="inline-block w-6 text-center">📦</span> Packaged in BPA-free, food-grade, and child-safe materials
          </p>
        </div>
      </section>
      {/* Stats Section */}
      <section className="bg-brand-teal-500 rounded-xl p-8 md:p-12 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10+", label: "Products" },
            { value: "20K+", label: "Happy Customers" },
            { value: "1+", label: "Years Experience" },
            { value: "24/7", label: "Customer Support" }
          ].map((stat, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-4xl md:text-5xl font-bold">{stat.value}</h3>
              <p className="text-brand-cream text-lg">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="space-y-8">
        <SectionTitle title="Get In Touch" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <MapPin className="text-brand-teal-500 w-6 h-6" />,
              title: "Our Location",
              content: "Savar, Dhaka"
            },
            {
              icon: <Phone className="text-brand-teal-500 w-6 h-6" />,
              title: "Phone",
              content: (
                <>
                  <a href="tel:+8801957810247" className="block hover:text-brand-teal-500 transition-colors">
                    01957810247
                  </a>
                  <a href="tel:+8801957810247" className="block hover:text-brand-teal-500 transition-colors">
                    01957810247
                  </a>
                </>
              )
            },
            {
              icon: <Mail className="text-brand-teal-500 w-6 h-6" />,
              title: "Email",
              content: (
                <>
                  <a href="mailto:kurban0164@gmail.com" className="block hover:text-brand-teal-500 transition-colors">
                    kurban0164@gmail.com
                  </a>
                  <a href="mailto:kurban0164@gmail.com" className="block hover:text-brand-teal-500 transition-colors">
                    kurban0164@gmail.com
                  </a>
                </>
              )
            },
            {
              icon: <Clock className="text-brand-teal-500 w-6 h-6" />,
              title: "Working Hours",
              content: "Always Open"
            }
          ].map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-brand-gray-light hover:shadow-md transition-shadow">
              <div className="bg-brand-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold text-brand-teal-500 mb-3">{card.title}</h3>
              <div className="text-brand-gray-base space-y-1">
                {card.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="space-y-8">
        <SectionTitle title="Find Us" />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-gray-light">
          <div className="w-full h-80 md:h-96 bg-brand-cream rounded-lg overflow-hidden border-4 border-brand-teal-200">
            <img 
              src={map} 
              alt="Our location on map" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-teal-400 to-brand-teal-500 rounded-xl p-12 text-center text-white space-y-8">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Have Questions?</h2>
          <p className="text-xl">
            Our team is ready to help you with any inquiries you may have.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="https://wa.me/8801957810247"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-brand-teal-500 hover:bg-brand-cream px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Contact Us
          </a>
          <a
            href="https://wa.me/8801957810247"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border-2 border-white hover:bg-white hover:text-brand-teal-500 px-8 py-3 rounded-lg font-medium transition-all hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Live Chat
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;