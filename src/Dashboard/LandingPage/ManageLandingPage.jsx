import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Landmark,
  Package,
  Edit,
} from "lucide-react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAllProducts from "../../hooks/useAllProducts";
import { imgbbKey } from "../../hooks/useImgbb";
import Loader from "../../components/Loader";

const ManageLandingPage = () => {
  const [formData, setFormData] = useState({
    hero: { title: "", subtitle: "", image: "" },
    featuredProductId: "",
    sections: [],
  });
  const [isUploading, setIsUploading] = useState({ status: false, id: null });

  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [products, loadingProducts] = useAllProducts();

  // Fetch existing landing page data
  const { data: _landingPageData, isLoading: isLoadingData } = useQuery({
    queryKey: ["landingPage"],
    queryFn: async () => {
      const res = await axiosSecure.get("v1/landing-page");
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        setFormData({
          hero: data.hero || { title: "", subtitle: "", image: "" },
          featuredProductId: data.featuredProductId || "",
          sections: data.sections || [],
        });
      }
    },
    onError: (error) => {
      // It's okay if it fails (e.g., 404), means no data is set yet.
      console.info(
        "No existing landing page data found. Ready to create new.",
        error.response?.data?.message
      );
    },
  });

  // Mutation to update the landing page
  const { mutate: updateLandingPage, isLoading: isSubmitting } = useMutation({
    mutationFn: async (newData) => {
      const res = await axiosSecure.post("/landing-page", newData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Landing page updated successfully!");
      queryClient.invalidateQueries(["landingPage"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update landing page");
    },
  });

  const handleInputChange = (e, sectionIndex = null) => {
    const { name, value } = e.target;

    if (sectionIndex !== null) {
      const newSections = [...formData.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        [name]: value,
      };
      setFormData({ ...formData, sections: newSections });
    } else if (name.startsWith("hero.")) {
      const heroField = name.split(".")[1];
      setFormData({
        ...formData,
        hero: { ...formData.hero, [heroField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (file, sectionIndex = null) => {
    const uploadId = sectionIndex !== null ? `section-${sectionIndex}` : "hero";
    setIsUploading({ status: true, id: uploadId });

    const imageForm = new FormData();
    imageForm.append("image", file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
        {
          method: "POST",
          body: imageForm,
        }
      );
      const data = await res.json();
      if (data.success) {
        const imageUrl = data.data.url;
        if (sectionIndex !== null) {
          const newSections = [...formData.sections];
          newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            image: imageUrl,
          };
          setFormData({ ...formData, sections: newSections });
        } else {
          setFormData({
            ...formData,
            hero: { ...formData.hero, image: imageUrl },
          });
        }
        toast.success("Image uploaded!");
      } else {
        throw new Error(data.error.message);
      }
    } catch (error) {
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      setIsUploading({ status: false, id: null });
    }
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: "", text: "", image: "" }],
    });
  };

  const removeSection = (index) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.featuredProductId) {
      toast.error("Please select a featured product.");
      return;
    }
    updateLandingPage(formData);
  };

  if (loadingProducts || isLoadingData) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Landmark className="text-brand-teal-base" />
            Manage Landing Page
          </h1>
          <p className="text-gray-500 mt-1">
            Customize the content and featured product for your main offer page.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Featured Product Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Package /> Featured Product
            </h2>
            <select
              name="featuredProductId"
              value={formData.featuredProductId}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-base focus:border-brand-teal-base"
              required
            >
              <option value="">-- Select a Product --</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hero Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Hero Section
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                name="hero.title"
                placeholder="Hero Title (e.g., The Ultimate Baby Nutrition)"
                value={formData.hero.title}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <textarea
                name="hero.subtitle"
                placeholder="Hero Subtitle (e.g., 100% natural, homemade goodness for your little one's growth.)"
                value={formData.hero.subtitle}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows="3"
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Hero Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-teal-light file:text-brand-teal-base hover:file:bg-brand-teal-base hover:file:text-white"
                />
                {isUploading.status && isUploading.id === "hero" && (
                  <Loader2 className="animate-spin mt-2" />
                )}
                {formData.hero.image && (
                  <img
                    src={formData.hero.image}
                    alt="Hero Preview"
                    className="mt-4 rounded-lg max-h-48"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Content Sections */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Content Sections
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 bg-brand-teal-base text-white rounded-lg hover:bg-brand-teal-dark"
              >
                <Plus size={18} /> Add Section
              </button>
            </div>

            {formData.sections.map((section, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border relative"
              >
                <h3 className="text-lg font-semibold text-gray-600 mb-4">
                  Section {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    placeholder={`Section ${index + 1} Title`}
                    value={section.title}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    name="text"
                    placeholder={`Section ${index + 1} Text`}
                    value={section.text}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows="4"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Section Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e.target.files[0], index)
                      }
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-teal-light file:text-brand-teal-base hover:file:bg-brand-teal-base hover:file:text-white"
                    />
                    {isUploading.status &&
                      isUploading.id === `section-${index}` && (
                        <Loader2 className="animate-spin mt-2" />
                      )}
                    {section.image && (
                      <img
                        src={section.image}
                        alt={`Section ${index + 1} Preview`}
                        className="mt-4 rounded-lg max-h-48"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting || isUploading.status}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-teal-base text-white font-semibold rounded-lg shadow-md hover:bg-brand-teal-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Edit />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageLandingPage;
