import React from "react";
import { useParams, Link } from "react-router-dom";
import useSingleBlog from "../../hooks/useSingleBlog";
import useBlogs from "../../hooks/useBlogs";
import Loader from "../../components/Loader";
import FormattedText from "../../components/TextFormatting";

const SingleBlogPost = () => {
  const { id } = useParams();
  const { blog, isLoading: isLoadingBlog } = useSingleBlog(id);
  const { blogs, isLoading: isLoadingBlogs } = useBlogs();

  if (isLoadingBlog || isLoadingBlogs) {
    return <Loader />;
  }

  if (!blog) {
    return (
      <div className="text-center text-xl py-12 text-gray-700">
        Blog post not found.
      </div>
    );
  }

  const relatedPosts = blogs.filter((p) => p._id !== id).slice(0, 3);

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg">
            <article>
              <header className="mb-5">
                <h1 className="text-2xl md:text-4xl font-extrabold text-teal-800 mb-4 leading-tight">
                  {blog.title}
                </h1>
                <p className="text-md text-gray-500 font-medium">
                  Posted on{" "}
                  <time dateTime={new Date(blog.createdAt).toISOString()}>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </time>
                </p>
              </header>

              {/* Featured Image Section */}
              <figure>
                <img
                  src={blog.img}
                  alt={blog.title}
                  className="w-full h-auto max-h-[400px] rounded-xl shadow-md mb-3 object-fill"
                />
              </figure>

              {/* Blog Content */}

              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                <FormattedText text={blog.content} />
              </div>
            </article>
          </div>

          {/* Sidebar - Related Posts */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-teal-800 mb-6 border-b-2 border-teal-600 pb-3">
                Related Blogs
              </h3>

              <div className="space-y-4">
                {relatedPosts.map((post) => (
                  <Link
                    to={`/blog/${post._id}`}
                    key={post._id}
                    className="block p-3 -mx-3 rounded-xl hover:bg-teal-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Related Post Image */}
                      <img
                        src={post.img}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm flex-shrink-0"
                      />

                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 group-hover:text-teal-700 transition-colors leading-snug">
                          {post.title}
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Fallback for no related posts */}
                {relatedPosts.length === 0 && (
                  <p className="text-gray-500 italic">
                    No related posts found.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPost;
