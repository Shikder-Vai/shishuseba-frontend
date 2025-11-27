import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Plus, Trash2, Loader2, Edit, BookOpen } from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAllProducts from "../../hooks/useAllProducts";
import Loader from "../../components/Loader";

const ManageTemplate3 = ({ id }) => {
  const navigate = useNavigate();
  const isEditMode = id !== "new";

  const [formData, setFormData] = useState({
    templateId: "template3",
    name: "",
    featuredProductId: "",
    headerTitle: "",
    headerSubtitle: "",
    productImage: "",
    orderButtonText: "এখনই অর্ডার করুন",
    benefitsTitle: " এর উপকারিতা:",
    benefits: [""],
    certificateTitle: "পরীক্ষিত ল্যাব-টেস্ট রির্পোট",
    certificateImage: "",
    previousPriceText: "ডেলিভারির পূর্বের মূল্য",
    previousPrice: "",
    offerPriceText: "অফার মূল্য",
    offerPrice: "",
    cartButtonText: "এখনই অর্ডার করুন",
    testimonialsTitle: "000+ সন্তুষ্ট সমর্থিত গ্রাহকের মতামত",
    videoUrl: "",
    footerPhoneNumbers: "",
    footerCopyright: `© ${new Date().getFullYear()} All rights reserved.`,
  });

  const [uploading, setUploading] = useState(false);

  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [products, loadingProducts] = useAllProducts();

  const { data, isLoading: isLoadingData } = useQuery({
    queryKey: ["landingPage", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/landing-pages/${id}`);
      return res.data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleImageUpload = async (file, onSuccess) => {
    const form = new FormData();
    form.append("image", file);
    setUploading(true);

    try {
      const res = await axiosPublic.post("/upload/landing-page-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.imageUrl) {
        onSuccess(res.data.imageUrl);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const { mutate: saveLandingPage, isLoading: isSaving } = useMutation({
    mutationFn: (formData) => {
      return isEditMode
        ? axiosPublic.put(`/landing-pages/${id}`, formData)
        : axiosPublic.post("/landing-pages", formData);
    },
    onSuccess: () => {
      toast.success(
        `Landing page ${isEditMode ? "updated" : "created"} successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["landingPages"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["landingPage", id] });
      }
      navigate("/dashboard/landing-pages");
    },
    onError: (error) => {
      toast.error(
        error.message || `Failed to ${isEditMode ? "update" : "create"}`
      );
    },
  });

  const handleInputChange = (e, field, index = null) => {
    const { name, value } = e.target;
    const newFormData = { ...formData };

    if (field) {
      if (index !== null) {
        newFormData[field][index] = value;
      } else {
        newFormData[field] = value;
      }
    } else {
      newFormData[name] = value;
    }
    setFormData(newFormData);
  };

  const handleAddItem = (field) => {
    const newFormData = { ...formData };
    newFormData[field].push("");
    setFormData(newFormData);
  };

  const handleRemoveItem = (field, index) => {
    const newFormData = { ...formData };
    newFormData[field].splice(index, 1);
    setFormData(newFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${
        isEditMode ? "save changes to" : "create"
      } this landing page?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00897B",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${isEditMode ? "save it" : "create it"}!`,
    }).then((result) => {
      if (result.isConfirmed) {
        saveLandingPage(formData);
      }
    });
  };

  if (isLoadingData) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isEditMode ? "Edit" : "Create"} Landing Page (Template 3)
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page Info */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <div>
              <label className="text-lg font-semibold text-gray-700">
                Page Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Winter Special Oil"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border rounded-lg mt-2"
                required
              />
            </div>
            <div>
              <label className="text-lg font-semibold text-gray-700">
                Featured Product
              </label>
              {loadingProducts ? (
                <Loader />
              ) : (
                <select
                  name="featuredProductId"
                  value={formData.featuredProductId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featuredProductId: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg mt-2"
                  required
                >
                  <option value="">-- Select a Product --</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name.en}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Header Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen /> Header Section
            </h2>
            <input
              type="text"
              name="headerTitle"
              placeholder="Header Title"
              value={formData.headerTitle}
              onChange={(e) => handleInputChange(e, "headerTitle")}
              className="w-full p-2 border rounded"
            />
            <textarea
              name="headerSubtitle"
              placeholder="Header Subtitle"
              value={formData.headerSubtitle}
              onChange={(e) => handleInputChange(e, "headerSubtitle")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Product Image Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Product Image</h2>
            <input
              type="text"
              name="productImage"
              placeholder="Product Image URL"
              value={formData.productImage}
              onChange={(e) => handleInputChange(e, "productImage")}
              className="w-full p-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) =>
                e.target.files[0] &&
                handleImageUpload(e.target.files[0], (url) =>
                  setFormData((prev) => ({ ...prev, productImage: url }))
                )
              }
              className="w-full text-sm p-1 border rounded-lg"
            />
            {uploading && <Loader2 className="animate-spin h-4 w-4" />}
            {formData.productImage && (
              <img
                src={formData.productImage}
                alt="Product"
                className="rounded-lg max-h-48"
              />
            )}
          </div>

          {/* Benefits Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Benefits Section</h2>
            <input
              type="text"
              name="benefitsTitle"
              placeholder="Benefits Title"
              value={formData.benefitsTitle}
              onChange={(e) => handleInputChange(e, "benefitsTitle")}
              className="w-full p-2 border rounded"
            />
            {(formData.benefits || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleInputChange(e, "benefits", index)}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("benefits", index)}
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("benefits")}
              className="flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Benefit
            </button>
          </div>

          {/* Certificate Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Certificate Section</h2>
            <input
              type="text"
              name="certificateTitle"
              placeholder="Certificate Title"
              value={formData.certificateTitle}
              onChange={(e) => handleInputChange(e, "certificateTitle")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="certificateImage"
              placeholder="Certificate Image URL"
              value={formData.certificateImage}
              onChange={(e) => handleInputChange(e, "certificateImage")}
              className="w-full p-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) =>
                e.target.files[0] &&
                handleImageUpload(e.target.files[0], (url) =>
                  setFormData((prev) => ({ ...prev, certificateImage: url }))
                )
              }
              className="w-full text-sm p-1 border rounded-lg"
            />
            {uploading && <Loader2 className="animate-spin h-4 w-4" />}
            {formData.certificateImage && (
              <img
                src={formData.certificateImage}
                alt="Certificate"
                className="rounded-lg max-h-48"
              />
            )}
          </div>

          {/* Pricing Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Pricing Section</h2>
            <input
              type="text"
              name="previousPriceText"
              placeholder="Previous Price Text"
              value={formData.previousPriceText}
              onChange={(e) => handleInputChange(e, "previousPriceText")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="previousPrice"
              placeholder="Previous Price"
              value={formData.previousPrice}
              onChange={(e) => handleInputChange(e, "previousPrice")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="offerPriceText"
              placeholder="Offer Price Text"
              value={formData.offerPriceText}
              onChange={(e) => handleInputChange(e, "offerPriceText")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="offerPrice"
              placeholder="Offer Price"
              value={formData.offerPrice}
              onChange={(e) => handleInputChange(e, "offerPrice")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Testimonials Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Testimonials Section</h2>
            <input
              type="text"
              name="testimonialsTitle"
              placeholder="Testimonials Title"
              value={formData.testimonialsTitle}
              onChange={(e) => handleInputChange(e, "testimonialsTitle")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="videoUrl"
              placeholder="Youtube Video URL"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange(e, "videoUrl")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Footer Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Footer Section</h2>
            <input
              type="text"
              name="footerPhoneNumbers"
              placeholder="Footer Phone Numbers"
              value={formData.footerPhoneNumbers}
              onChange={(e) => handleInputChange(e, "footerPhoneNumbers")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="footerCopyright"
              placeholder="Footer Copyright Text"
              value={formData.footerCopyright}
              onChange={(e) => handleInputChange(e, "footerCopyright")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Button Texts */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Button Texts</h2>
            <input
              type="text"
              name="orderButtonText"
              placeholder="Order Button Text"
              value={formData.orderButtonText}
              onChange={(e) => handleInputChange(e, "orderButtonText")}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="cartButtonText"
              placeholder="Cart Button Text"
              value={formData.cartButtonText}
              onChange={(e) => handleInputChange(e, "cartButtonText")}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={isSaving || uploading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-teal-base text-white font-semibold rounded-lg shadow-md hover:bg-brand-teal-dark disabled:opacity-50"
            >
              {isSaving || uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Edit />
              )}
              {isSaving || uploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageTemplate3;
