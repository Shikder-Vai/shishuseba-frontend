import React from "react";
import ReactPlayer from "react-player";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Loader2 } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import SectionTitle from "../../components/SectionTitle";

const OurGallery = () => {
  const axiosPublic = useAxiosPublic();
  // const currentOrigin =
  //   typeof window !== "undefined" ? window.location.origin : "";

  const {
    data: videos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["youtubeVideos"],
    queryFn: async () => {
      const response = await axiosPublic.get("/youtube");
      return response.data.videos || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const validVideos = videos
    .filter((video) => video?.url && video.url.trim() !== "")
    .map((video) => ({
      id: video._id,
      url: video.url,
    }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin text-brand-orange-base" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-500">
        Failed to load gallery videos. Please try again later.
      </div>
    );
  }

  return (
    <div className=" bg-cream-gradient">
      <SectionTitle title="Our Gallery" />
      {validVideos.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {validVideos.map((video) => (
            <div
              key={video.id}
              className="player-wrapper relative rounded-lg overflow-hidden shadow-soft bg-black"
              style={{ paddingTop: "56.25%" }}
            >
              <ReactPlayer
                url={video.url}
                className="react-player absolute top-0 left-0"
                width="100%"
                height="100%"
                controls
                playing={false}
                config={{
                  youtube: {
                    playerVars: {
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                    },
                  },
                }}
              />
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12 text-brand-gray-base font-medium">
          No videos available in the gallery
        </div>
      )}
    </div>
  );
};

export default OurGallery;
