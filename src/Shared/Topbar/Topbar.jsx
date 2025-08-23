import { useEffect, useState } from "react";
import { FiPhone, FiMail } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

const Topbar = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`text-white text-xs px-4 py-2 md:flex md:justify-between items-center transition-all duration-500 ease-in-out ${
        isVisible ? "bg-teal-gradient translate-y-0" : " -translate-y-full"
      } shadow-soft`}
    >
      {/* Left - Contact Info */}
      <div className="flex gap-4 justify-center">
        <div className="flex gap-2 items-center">
          <FiPhone className="text-brand-orange-light size-4 md:size-5" />
          <span className="font-medium">01957810247</span>
        </div>
        <div className="flex gap-2 items-center">
          <FiMail className="text-brand-orange-light size-4 md:size-5" />
          <span className="font-medium">shishuseba@gmail.com</span>
        </div>
      </div>

      {/* Right - Social Icons */}
      <div className="flex gap-3 justify-center mt-2 md:mt-0">
        <a href="#" className="hover:scale-110 transition">
          <FaFacebookF className="text-white/90 hover:text-white size-4 md:size-5" />
        </a>
        <a href="#" className="hover:scale-110 transition">
          <FaInstagram className="text-white/90 hover:text-white size-4 md:size-5" />
        </a>
        <a href="#" className="hover:scale-110 transition">
          <FaYoutube className="text-white/90 hover:text-white size-4 md:size-5" />
        </a>
      </div>
    </div>
  );
};

export default Topbar;
