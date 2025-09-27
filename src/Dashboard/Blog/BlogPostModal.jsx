import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { toast } from "sonner";
import useImgUpload from "../../hooks/useImgUpload";
import { FiX, FiUpload } from "react-icons/fi";

const BlogPostModal = ({ isOpen, onClose, blog }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [img, setImg] = useState(null);
  const { isUploading, uploadImg } = useImgUpload();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setImg(blog.img);
    } else {
      setTitle("");
      setContent("");
      setImg(null);
    }
  }, [blog]);

  const { mutate: createBlog, isLoading: isCreating } = useMutation({
    mutationFn: (newBlog) => axiosSecure.post("/blogs", newBlog),
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]);
      toast.success("Blog post created successfully");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create blog post");
    },
  });

  const { mutate: updateBlog, isLoading: isUpdating } = useMutation({
    mutationFn: (updatedBlog) =>
      axiosSecure.put(`/blogs/${blog._id}`, updatedBlog),
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]);
      toast.success("Blog post updated successfully");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update blog post");
    },
  });

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const imageUrl = await uploadImg(e.target.files[0]);
        setImg(imageUrl);
        toast.success("Image uploaded successfully");
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Image upload failed");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!img) {
      toast.error("Please upload an image.");
      return;
    }
    const blogData = { title, content, img };

    if (blog) {
      updateBlog(blogData);
    } else {
      createBlog(blogData);
    }
  };

  if (!isOpen) {
    return null;
  }

  const isLoading = isUploading || isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {blog ? "Edit Blog Post" : "Create New Post"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={24} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="Enter a catchy title"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {img ? (
                    <img
                      src={img}
                      alt="Preview"
                      className="mx-auto h-32 w-auto rounded-md object-cover"
                    />
                  ) : (
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      <span>
                        {isUploading ? "Uploading..." : "Upload a file"}
                      </span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="Write your blog post here..."
                required
              ></textarea>
            </div>

            <div className="flex justify-end items-center space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-orange-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : blog ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogPostModal;
