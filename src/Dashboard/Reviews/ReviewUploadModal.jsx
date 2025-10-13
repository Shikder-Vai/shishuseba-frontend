import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useScrollToTop from "../../hooks/useScrollToTop";

const ReviewUploadModal = ({ isOpen, onClose }) => {
  useScrollToTop();
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const { mutate: addReview, isLoading } = useMutation({
    mutationFn: (newReview) => axiosPublic.post("/reviews", newReview),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      toast.success("Review added successfully");
      onClose();
    },
    onError: () => {
      toast.error("Failed to add review");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await axiosPublic.post("/upload/review-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = res.data.imageUrl;
      if (imageUrl) {
        addReview({ imageUrl });
      } else {
        throw new Error("Image upload failed to return a URL.");
      }
    } catch (error) {
      toast.error("Image upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Review</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Review Screenshot
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isLoading}
              className="btn bg-orange-500 text-white"
            >
              {isUploading || isLoading ? "Uploading..." : "Add Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewUploadModal;
