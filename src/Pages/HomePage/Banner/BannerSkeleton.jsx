// components/Banner/BannerSkeleton.jsx
import React from "react";

const BannerSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-[400px] md:h-[500px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-64 mx-auto mb-6"></div>
          <div className="h-12 bg-gray-300 rounded-full w-40 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default BannerSkeleton;