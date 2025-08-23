import React from "react";

const Loader = () => {
  return (
    <div className="min-h-72 flex flex-col justify-center items-center gap-">
      {/* Main orb with gradient pulse */}
      <div className="relative">
        {/* Pulsing teal core */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-teal-100 to-brand-teal-300 animate-pulse shadow-lg shadow-brand-teal-100/30"></div>
        
        {/* Orbiting orange dots (3x) */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-3 h-3 rounded-full bg-brand-orange-base animate-orbit"
            style={{
              animationDelay: `${i * 0.5}s`,
              transformOrigin: `0 40px`, // Orbit radius
            }}
          ></div>
        ))}
      </div>

      {/* Optional minimalist loading text */}
      <p className="text-brand-gray-base font-medium animate-fade-in">Loading...</p>
    </div>
  );
};

export default Loader;