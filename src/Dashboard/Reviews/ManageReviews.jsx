import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useReviews from "../../hooks/useReviews";
import Loader from "../../components/Loader";
import ReviewUploadModal from "./ReviewUploadModal";
import Swal from "sweetalert2";
import { useRole } from "../../hooks/useRole";

const ManageReviews = () => {
  const { reviews, loadingReviews, refetch } = useReviews();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const role = useRole();

  const { mutate: deleteReview } = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      toast.success("Review deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteReview(id);
      }
    });
  };

  if (loadingReviews) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto mb-20 px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            For best results, please upload images with a 3:2 aspect ratio (e.g., 600x400 pixels).
          </p>
        </div>
        {(role === "admin" || role === "moderator") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn bg-orange-500 text-white"
          >
            Add New Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <img src={review.imageUrl} alt="Review" className="w-full h-48 object-cover" />
            <div className="p-4">
              {role === "admin" && (
                <button
                  onClick={() => handleDelete(review._id)}
                  className="btn btn-sm btn-outline btn-error w-full"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ReviewUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refetch={refetch}
      />
    </div>
  );
};

export default ManageReviews;
