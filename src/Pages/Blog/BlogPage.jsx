import React from "react";
import useBlogs from "../../hooks/useBlogs";
import BlogPostCard from "../../components/Blog/BlogPostCard";
import Loader from "../../components/Loader";

const BlogPage = () => {
  const { blogs, isLoading } = useBlogs();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen mb-20">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 text-orange-400">
            মা ও শিশু বিষয়ক ব্লগ পড়ুন
          </h1>
          <p className="text-xl font-bold text-teal-500 max-w-2xl mx-auto">
            মা ও শিশুর স্বাস্থ্য ও পুষ্টি সম্পর্কে জানুন
          </p>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
