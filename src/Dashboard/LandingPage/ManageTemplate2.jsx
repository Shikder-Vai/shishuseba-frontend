import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Plus, Trash2, Loader2, Edit } from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAllProducts from "../../hooks/useAllProducts";
import Loader from "../../components/Loader";

const ManageTemplate2 = ({ id }) => {
  const navigate = useNavigate();
  const isEditMode = id !== "new";

  const [formData, setFormData] = useState({
    templateId: "template2",
    name: "",
    featuredProductId: "",
    noticeBar: { text: "", bgColor: "#e11d48", textColor: "#ffffff" },
    hero: {
      title: "",
      videoUrl: "",
      subtitle: "",
      features: [""],
      buttonText: "অর্ডার করুন",
      buttonBgColor: "#16a34a",
      buttonTextColor: "#ffffff",
      bgColor: "#f4fce3",
      titleColor: "#15803d",
    },
    whyChooseUs: {
      title: "",
      features: [""],
      buttonText: "অর্ডার করুন",
      buttonBgColor: "#000000",
      buttonTextColor: "#ffffff",
      titleBgColor: "#16a34a",
      titleColor: "#ffffff",
    },
    usage: {
      title: "",
      description: "",
      buttonText: "অর্ডার করুন",
      buttonBgColor: "#000000",
      buttonTextColor: "#ffffff",
    },
    testimonials: [{ text: "", author: "", image: "" }],
    customerVideos: [{ url: "", title: "" }],
    pricing: {
      originalPrice: "",
      offerPrice: "",
      subtitle: "",
      buttonText: "অর্ডার করুন",
      bgColor: "#15803d",
      textColor: "#ffffff",
      offerPriceColor: "#fbbf24",
      buttonBgColor: "#000000",
      buttonTextColor: "#ffffff",
    },
    labTest: { title: "", subtitle: "", image: "" },
    orderInstructions: { text: "" },
    footer: { text: "", bgColor: "#15803d", textColor: "#ffffff" },
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

  const handleImageUpload = async (file, onSuccess) => {
    const form = new FormData();
    form.append("image", file);
    setUploading(true);

    try {
      const res = await axiosPublic.post("/upload/landing-page-image", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.imageUrl) {
        onSuccess(res.data.imageUrl);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const { mutate: saveLandingPage, isLoading: isSaving } = useMutation({
    mutationFn: (formData) => {
      if (isEditMode) {
        return axiosPublic.put(`/landing-pages/${id}`, formData);
      } else {
        return axiosPublic.post("/landing-pages", formData);
      }
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

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleInputChange = (
    e,
    section,
    field,
    index = null,
    subField = null
  ) => {
    const { name, value } = e.target;
    const newFormData = { ...formData };

    if (section) {
      if (index !== null) {
        if (field) {
          newFormData[section][field][index] = value;
        } else {
          newFormData[section][index][subField] = value;
        }
      } else {
        newFormData[section][field || name] = value;
      }
    } else {
      newFormData[name] = value;
    }

    setFormData(newFormData);
  };

  const handleAddItem = (section, field) => {
    const newFormData = { ...formData };
    if (section === "testimonials") {
      newFormData[section].push({ text: "", author: "", image: "" });
    } else if (section === "customerVideos") {
      newFormData[section].push({ url: "", title: "" });
    } else {
      newFormData[section][field].push("");
    }
    setFormData(newFormData);
  };

  const handleRemoveItem = (section, field, index) => {
    const newFormData = { ...formData };
    if (field) {
      newFormData[section][field].splice(index, 1);
    } else {
      newFormData[section].splice(index, 1);
    }
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
      confirmButtonText: `Yes, ${isEditMode ? "save it" : "create it"}! `,
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
          {isEditMode
            ? "Edit Landing Page (Template 2)"
            : "Create New Landing Page (Template 2)"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <label className="text-lg font-semibold text-gray-700">
              Page Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Baby Care Oil"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
              required
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Featured Product</h2>
            {loadingProducts ? (
              <Loader />
            ) : (
              <select
                name="featuredProductId"
                value={formData.featuredProductId}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
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

          {/* Notice Bar Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Notice Bar</h2>
            <input
              type="text"
              name="text"
              placeholder="Notice Text"
              value={formData.noticeBar.text}
              onChange={(e) => handleInputChange(e, "noticeBar", "text")}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Background Color</label>
                <input
                  type="color"
                  name="bgColor"
                  value={formData.noticeBar.bgColor}
                  onChange={(e) => handleInputChange(e, "noticeBar", "bgColor")}
                  className="w-full h-10 p-1 border rounded"
                />
              </div>
              <div>
                <label>Text Color</label>
                <input
                  type="color"
                  name="textColor"
                  value={formData.noticeBar.textColor}
                  onChange={(e) =>
                    handleInputChange(e, "noticeBar", "textColor")
                  }
                  className="w-full h-10 p-1 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
            <input
              type="text"
              name="title"
              placeholder="Hero Title"
              value={formData.hero.title}
              onChange={(e) => handleInputChange(e, "hero", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="videoUrl"
              placeholder="Video URL"
              value={formData.hero.videoUrl}
              onChange={(e) => handleInputChange(e, "hero", "videoUrl")}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="subtitle"
              placeholder="Hero Subtitle"
              value={formData.hero.subtitle}
              onChange={(e) => handleInputChange(e, "hero", "subtitle")}
              className="w-full p-2 border rounded mb-2"
            />

            <h3 className="font-semibold mt-4 mb-2">Features List</h3>
            {formData.hero.features.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleInputChange(e, "hero", "features", index)
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("hero", "features", index)}
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("hero", "features")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Feature
            </button>

            <h3 className="font-semibold mt-4 mb-2">Button</h3>
            <input
              type="text"
              name="buttonText"
              placeholder="Button Text"
              value={formData.hero.buttonText}
              onChange={(e) => handleInputChange(e, "hero", "buttonText")}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Background Color</label>
                <input
                  type="color"
                  name="buttonBgColor"
                  value={formData.hero.buttonBgColor}
                  onChange={(e) =>
                    handleInputChange(e, "hero", "buttonBgColor")
                  }
                  className="w-full h-10 p-1 border rounded"
                />
              </div>
              <div>
                <label>Text Color</label>
                <input
                  type="color"
                  name="buttonTextColor"
                  value={formData.hero.buttonTextColor}
                  onChange={(e) =>
                    handleInputChange(e, "hero", "buttonTextColor")
                  }
                  className="w-full h-10 p-1 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Why Choose Us</h2>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.whyChooseUs.title}
              onChange={(e) => handleInputChange(e, "whyChooseUs", "title")}
              className="w-full p-2 border rounded mb-2"
            />

            <h3 className="font-semibold mt-4 mb-2">Features</h3>
            {formData.whyChooseUs.features.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleInputChange(e, "whyChooseUs", "features", index)
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("whyChooseUs", "features", index)
                  }
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("whyChooseUs", "features")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Feature
            </button>
          </div>

          {/* Usage Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Usage Section</h2>
            <input
              type="text"
              name="title"
              placeholder="Usage Title"
              value={formData.usage.title}
              onChange={(e) => handleInputChange(e, "usage", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="description"
              placeholder="Usage Description"
              value={formData.usage.description}
              onChange={(e) => handleInputChange(e, "usage", "description")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="buttonText"
              placeholder="Button Text"
              value={formData.usage.buttonText}
              onChange={(e) => handleInputChange(e, "usage", "buttonText")}
              className="w-full p-2 border rounded mb-2"
            />
          </div>

          {/* Testimonials Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Testimonials</h2>
            {formData.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg mb-2 bg-gray-50"
              >
                <textarea
                  placeholder="Testimonial Text"
                  value={testimonial.text}
                  onChange={(e) =>
                    handleInputChange(e, "testimonials", null, index, "text")
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={testimonial.author}
                  onChange={(e) =>
                    handleInputChange(e, "testimonials", null, index, "author")
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={testimonial.image}
                  onChange={(e) =>
                    handleInputChange(e, "testimonials", null, index, "image")
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="file"
                  onChange={(e) =>
                    e.target.files[0] &&
                    handleImageUpload(e.target.files[0], (url) => {
                      const newFormData = { ...formData };
                      newFormData.testimonials[index].image = url;
                      setFormData(newFormData);
                    })
                  }
                  className="w-full text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("testimonials", null, index)}
                  className="text-red-500 mt-2"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("testimonials")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Testimonial
            </button>
          </div>

          {/* Customer Videos Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Customer Videos</h2>
            {formData.customerVideos.map((video, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg mb-2 bg-gray-50"
              >
                <input
                  type="text"
                  placeholder="Video URL"
                  value={video.url}
                  onChange={(e) =>
                    handleInputChange(e, "customerVideos", null, index, "url")
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Video Title"
                  value={video.title}
                  onChange={(e) =>
                    handleInputChange(e, "customerVideos", null, index, "title")
                  }
                  className="w-full p-2 border rounded mb-2"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("customerVideos", null, index)
                  }
                  className="text-red-500 mt-2"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("customerVideos")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Video
            </button>
          </div>

          {/* Pricing Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Pricing Section</h2>
            <input
              type="text"
              placeholder="Original Price"
              name="originalPrice"
              value={formData.pricing.originalPrice}
              onChange={(e) => handleInputChange(e, "pricing", "originalPrice")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Offer Price"
              name="offerPrice"
              value={formData.pricing.offerPrice}
              onChange={(e) => handleInputChange(e, "pricing", "offerPrice")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Subtitle"
              name="subtitle"
              value={formData.pricing.subtitle}
              onChange={(e) => handleInputChange(e, "pricing", "subtitle")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Button Text"
              name="buttonText"
              value={formData.pricing.buttonText}
              onChange={(e) => handleInputChange(e, "pricing", "buttonText")}
              className="w-full p-2 border rounded mb-2"
            />
          </div>

          {/* Lab Test Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Lab Test Section</h2>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.labTest.title}
              onChange={(e) => handleInputChange(e, "labTest", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="subtitle"
              placeholder="Subtitle"
              value={formData.labTest.subtitle}
              onChange={(e) => handleInputChange(e, "labTest", "subtitle")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={formData.labTest.image}
              onChange={(e) => handleInputChange(e, "labTest", "image")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="file"
              onChange={(e) =>
                e.target.files[0] &&
                handleImageUpload(e.target.files[0], (url) => {
                  const newFormData = { ...formData };
                  newFormData.labTest.image = url;
                  setFormData(newFormData);
                })
              }
              className="w-full text-sm"
            />
          </div>

          {/* Order Instructions Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Order Instructions</h2>
            <textarea
              name="text"
              placeholder="Instructions Text"
              value={formData.orderInstructions.text}
              onChange={(e) =>
                handleInputChange(e, "orderInstructions", "text")
              }
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Footer Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Footer</h2>
            <input
              type="text"
              name="text"
              placeholder="Footer Text"
              value={formData.footer.text}
              onChange={(e) => handleInputChange(e, "footer", "text")}
              className="w-full p-2 border rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Background Color</label>
                <input
                  type="color"
                  name="bgColor"
                  value={formData.footer.bgColor}
                  onChange={(e) => handleInputChange(e, "footer", "bgColor")}
                  className="w-full h-10 p-1 border rounded"
                />
              </div>
              <div>
                <label>Text Color</label>
                <input
                  type="color"
                  name="textColor"
                  value={formData.footer.textColor}
                  onChange={(e) => handleInputChange(e, "footer", "textColor")}
                  className="w-full h-10 p-1 border rounded"
                />
              </div>
            </div>
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

export default ManageTemplate2;
