import React from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

const BlogPostCard = ({ post }) => {
  // Function to truncate text to a certain number of words
  const truncateText = (text, wordLimit) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  return (
    <Link to={`/blog/${post._id}`} className="block group">
      <div className="relative rounded-xl transition-shadow duration-300 ease-in-out overflow-hidden">
        <div className="relative">
          <img
            src={post.img}
            alt={post.title}
            className="w-full h-56 transition-transform duration-300 group-hover:scale-105"
          />
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div> */}
          <div className="absolute top-4 right-4">
            <FiArrowUpRight
              className="text-white/80 group-hover:text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"
              size={24}
            />
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <h2 className="text-2xl font-bold text-gray-700 mb-3 leading-tight group-hover:text-orange-600 transition-colors duration-300">
            {post.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {truncateText(post.content, 25)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
