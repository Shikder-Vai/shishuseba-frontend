import { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useQuery } from "@tanstack/react-query";
import BannerSkeleton from "./BannerSkeleton";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const PLACEHOLDER_URL = `https://via.placeholder.com/1200x400/018b76/FFFFFF?text=Banner+Image`;

const Banner = () => {
  // eslint-disable-next-line no-unused-vars
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const axiosPublic = useAxiosPublic();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await axiosPublic.get("/banner");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      let bannerData = [];
      if (Array.isArray(data)) bannerData = data;
      else if (data?.image) bannerData = [data];
      else if (data?.banners) bannerData = data.banners;
      setBanners(bannerData);
    }
  }, [data]);

  if (isLoading) return <BannerSkeleton />;

  if (isError) {
    return (
      <div className="bg-gray-200 h-[400px] flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-lg font-bold mb-2">
          Failed to load banners
        </p>
        <p className="text-gray-700 text-sm max-w-md text-center">
          {error?.message || "Network error"}
        </p>
        <button
          className="mt-4 bg-brand-orange-base text-white px-4 py-2 rounded hover:bg-brand-orange-dark"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="bg-gray-200 h-[400px] flex flex-col items-center justify-center p-4">
        <p className="text-gray-700 text-lg mb-2">No banners available</p>
        <p className="text-gray-600 text-sm max-w-md text-center">
          Add banners through admin panel
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Carousel
        autoPlay
        interval={5000}
        infiniteLoop
        showArrows={banners.length > 1}
        showStatus={false}
        showIndicators={banners.length > 1}
        showThumbs={false}
        useKeyboardArrows
        onChange={setCurrentSlide}
        stopOnHover={false}
      >
        {banners.map((banner, index) => (
          <div key={banner._id || index} className="w-full">
            <img
              src={banner.image || PLACEHOLDER_URL}
              alt={banner.altText || `Banner ${index + 1}`}
              className="w-full h-auto mx-auto"
              loading="eager"
            />
            {banner.title && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
                <div className="text-center max-w-4xl">
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-sm md:text-base text-white drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;
