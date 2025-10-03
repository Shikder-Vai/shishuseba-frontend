import {
  Facebook,
  Youtube,
  Instagram,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import useCategories from "../../hooks/useCategories";
import logo from "../../assets/Logo/logo.png";

const Footer = () => {
  const [categories] = useCategories();
  return (
    <footer className="bg-brand-teal-400 text-gray-900 pt-20 relative z-10 select-none">
      {/* CTA Box */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-11/12 md:w-2/3 bg-gradient-to-r from-brand-orange-light to-brand-orange-base text-gray-900 py-3 px-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center text-center md:text-left z-20 mt-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide drop-shadow-sm">
          Stay with Shishu Seba
        </h2>
        <a
          href="tel:01957810247
"
          className="mt-5 md:mt-0 inline-block bg-white text-brand-orange-base font-semibold px-10 py-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-300"
        >
          CALL : 01957810247
        </a>
      </div>

      {/* Footer Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 px-8 md:px-20 pt-28 pb-12 max-w-7xl mx-auto">
        {/* Logo + Description */}
        <div>
          <Link to="/">
            <img className="w-[80px]" src={logo} alt="" />
          </Link>
          <p className="text-white mt-6 max-w-xs leading-relaxed font-light drop-shadow-sm">
            Welcome to Shishu Seba – where purity meets taste, and every bite
            tells a story of authenticity and care.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-7 mt-8">
            {[
              { Icon: Facebook, url: "#", label: "Facebook" },
              { Icon: Youtube, url: "#", label: "YouTube" },
              { Icon: Instagram, url: "#", label: "Instagram" },
              // eslint-disable-next-line no-unused-vars
            ].map(({ Icon, url, label }) => (
              <a
                key={label}
                href={url}
                aria-label={label}
                className="text-white hover:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                <Icon
                  size={28}
                  className="hover:scale-110 hover:drop-shadow-md transition-transform duration-300 ease-in-out"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h4 className="text-xl font-semibold mb-7 text-white border-b border-white/40 pb-2 drop-shadow-sm">
            Useful Links
          </h4>
          <ul className="space-y-4 text-sm text-white font-light">
            <li>
              <Link
                to="/about"
                className="hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/products/all"
                className="hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                Our Products
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Category */}
        <div>
          <h4 className="text-xl font-semibold mb-7 text-white border-b border-white/40 pb-2 drop-shadow-sm">
            Category
          </h4>
          <ul className="space-y-4 text-sm text-white font-light">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="cursor-pointer hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                <Link to={`/products/${cat.category}`}>{cat.en}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-semibold mb-7 text-white border-b border-white/40 pb-2 drop-shadow-sm">
            Contact
          </h4>
          <ul className="space-y-7 text-sm text-white font-light">
            <li className="flex items-center gap-3">
              <Phone className="text-brand-orange-base" size={18} />
              <a
                href="tel:01957810247"
                className="hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                01957810247
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-brand-orange-base" size={18} />
              <a
                href="mailto:info@shishusheba.com"
                className="hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out"
              >
                shishuseba@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="text-brand-orange-base mt-1" size={18} />
              <address className="not-italic hover:text-brand-orange-base focus:text-brand-orange-base transition-colors duration-300 ease-in-out">
                Savar, Dhaka
              </address>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-brand-orange-base text-center py-1 text-sm text-white font-medium tracking-wide drop-shadow-sm select-text">
        <span>
          &#169; {new Date().getFullYear()} shishu seba ltd. All Rights
          Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
