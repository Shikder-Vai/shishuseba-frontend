import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { UploadCloud, Trash2, Plus } from "lucide-react";
import { useRole } from "../../hooks/useRole";

const BannerContent = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBannerFile, setNewBannerFile] = useState(null);
  const role = useRole();

  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  // ✅ 1. Load existing banner images from backend
  const {
    data: banners = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await axiosPublic.get("/banner");
      return res.data;
    },
  });

  // ✅ 2. Image update mutation
  const mutation = useMutation({
    mutationFn: async ({ id, image }) => {
      const res = await axiosPublic.patch(`/banner/${id}`, { image });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      Swal.fire({
        icon: "success",
        title: "Image Updated!",
        text: "Banner image has been successfully updated",
        confirmButtonColor: "#ea580c",
      });
    },
    onError: (error) => {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Failed to update image",
        confirmButtonColor: "#ea580c",
      });
    },
  });

  // ✅ Add banner mutation
  const addMutation = useMutation({
    mutationFn: async (image) => {
      const res = await axiosPublic.post("/banner", { image });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setIsAddModalOpen(false);
      setNewBannerFile(null);
      Swal.fire("Success!", "New banner has been added.", "success");
    },
    onError: (error) => {
      Swal.fire("Error!", error.response?.data?.message || "Failed to add the banner.", "error");
    },
  });

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosPublic.delete(`/banner/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      Swal.fire("Deleted!", "The banner has been deleted.", "success");
    },
    onError: (error) => {
      Swal.fire("Error!", error.response?.data?.message || "Failed to delete the banner.", "error");
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // ✅ 3. File select
  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [id]: file }));
    }
  };

  // ✅ 4. Upload to backend
  const handleUpload = async (id) => {
    const file = selectedFiles[id];
    if (!file) {
      return Swal.fire({
        icon: "warning",
        title: "No Image Selected",
        text: "Please select an image first",
        confirmButtonColor: "#ea580c",
      });
    }

    setUploadingId(id);

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Upload to our backend
      const uploadRes = await axiosPublic.post("/upload/banner-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = uploadRes.data.imageUrl;

      if (imageUrl) {
        // Update backend with new image URL
        mutation.mutate({ id, image: imageUrl });
        
        // Clear the selected file for this banner
        setSelectedFiles(prev => {
          const updated = {...prev};
          delete updated[id];
          return updated;
        });
      } else {
        throw new Error("Image upload failed: No URL returned");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err.message || "Failed to upload image",
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddNewBanner = async () => {
    if (!newBannerFile) {
      return Swal.fire("No Image", "Please select an image for the new banner.", "warning");
    }

    const formData = new FormData();
    formData.append("image", newBannerFile);

    try {
      const uploadRes = await axiosPublic.post("/upload/banner-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = uploadRes.data.imageUrl;

      if (imageUrl) {
        addMutation.mutate(imageUrl);
      } else {
        throw new Error("Image upload failed: No URL returned");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Upload Failed", err.message || "Failed to upload image", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="text-center py-10">
          <h3 className="text-xl font-bold text-red-600 mb-2">
            Failed to Load Banners
          </h3>
          <p className="text-gray-600">
            Please try again later or contact support
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg py-8">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-800">
          Update Banner Images
        </h2>
        {(role === "admin" || role === "moderator") && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
          >
            <Plus size={18} />
            Add Banner
          </button>
        )}
      </div>

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Banner</h3>
            <input 
              type="file"
              accept="image/*"
              onChange={(e) => setNewBannerFile(e.target.files[0])}
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddNewBanner}
                disabled={addMutation.isLoading || !newBannerFile}
                className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-400"
              >
                {addMutation.isLoading ? "Uploading..." : "Upload & Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {banners.map(({ _id, image }, index) => (
          <div
            key={_id}
            className="flex flex-col md:flex-row items-start gap-6 p-4 border rounded-lg bg-gray-50"
          >
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Banner {index + 1}
              </p>
              <div className="relative">
                <img
                  src={image}
                  alt={`Banner ${index + 1}`}
                  className="w-32 h-20 md:w-40 md:h-24 rounded-md object-cover border shadow"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs bg-black bg-opacity-60 px-2 py-1 rounded">
                    Current
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-grow">
              {(role === "admin" || role === "moderator") && (
                <>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Upload New Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                      <input
                        type="file"
                        id={`file-${_id}`}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, _id)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white">
                        <div className="flex items-center">
                          <UploadCloud className="text-orange-500 mr-2" size={18} />
                          <span className="text-sm text-gray-500 truncate max-w-[120px]">
                            {selectedFiles[_id]
                              ? selectedFiles[_id].name
                              : "Choose file..."}
                          </span>
                        </div>
                        <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition">
                          Browse
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpload(_id)}
                      disabled={uploadingId === _id || !selectedFiles[_id]}
                      className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-semibold transition min-w-[120px] ${
                        uploadingId === _id
                          ? "bg-orange-400 cursor-not-allowed"
                          : selectedFiles[_id]
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {uploadingId === _id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        "Update Banner"
                      )}
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => handleDelete(_id)}
                        className="flex items-center justify-center px-4 py-2 rounded-md text-white font-semibold transition bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Recommended size: 1200x400 pixels (JPG, PNG, or WEBP)
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="font-bold text-orange-700 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Important Notes
        </h3>
        <ul className="mt-2 text-sm text-orange-600 list-disc pl-5 space-y-1">
          <li>
            Only upload new images if you want to replace the current banner
          </li>
          <li>Uploading will immediately replace the current banner image</li>
          <li>Leave unchanged if you don't want to update a banner</li>
        </ul>
      </div>
    </div>
  );
};

export default BannerContent;
