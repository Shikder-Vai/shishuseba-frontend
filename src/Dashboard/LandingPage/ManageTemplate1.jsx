import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Plus, Trash2, Loader2, Edit, Apple, Phone } from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAllProducts from "../../hooks/useAllProducts";
import Loader from "../../components/Loader";

const ManageTemplate1 = ({ id }) => {
  const navigate = useNavigate();
  const isEditMode = id !== "new";

  const [formData, setFormData] = useState({
    templateId: "template1",
    name: "",
    featuredProductId: "",
    hero: { title: "", subtitle: "", image: "" },
    features: { title: "", list: [""], image: "" },
    video: { title: "", subtitle: "", url: "" },
    gallery: { images: [{ src: "", alt: "" }] },
    specifications: { title: "", list: [{ icon: "", text: "" }] },
    whyChooseUs: { title: "", list: [""] },
    callToAction: { title: "", phone: "" },
    footer: { phoneNumber: "" },
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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
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
      if (field) {
        if (index !== null) {
          if (subField) {
            newFormData[section][field][index][subField] = value;
          } else {
            newFormData[section][field][index] = value;
          }
        } else {
          newFormData[section][field] = value;
        }
      } else {
        newFormData[section][name] = value;
      }
    } else {
      newFormData[name] = value;
    }

    setFormData(newFormData);
  };

  const handleAddItem = (section, field) => {
    const newFormData = { ...formData };
    if (field === "images") {
      newFormData[section][field].push({ src: "", alt: "" });
    } else if (field === "list" && section === "specifications") {
      newFormData[section][field].push({ icon: "", text: "" });
    } else {
      newFormData[section][field].push("");
    }
    setFormData(newFormData);
  };

  const handleRemoveItem = (section, field, index) => {
    const newFormData = { ...formData };
    newFormData[section][field].splice(index, 1);
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
            ? "Edit Landing Page (Template 1)"
            : "Create New Landing Page (Template 1)"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <label className="text-lg font-semibold text-gray-700">
              Page Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Hoco W35 Headphone"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
              required
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Apple /> Featured Product
            </h2>
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
            <textarea
              name="subtitle"
              placeholder="Hero Subtitle"
              value={formData.hero.subtitle}
              onChange={(e) => handleInputChange(e, "hero", "subtitle")}
              className="w-full p-2 border rounded mb-2"
            />
            {data?.featuredProduct?.images && (
              <img
                src={data.featuredProduct.images[0]}
                alt={data.featuredProduct.name}
                className="w-full h-auto object-cover rounded-lg"
              />
            )}
          </div>

          {/* Features Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Features Section</h2>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.features.title}
              onChange={(e) => handleInputChange(e, "features", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
              <input
                type="text"
                name="image"
                placeholder="Enter Image URL"
                value={formData.features.image}
                onChange={(e) => handleInputChange(e, "features", "image")}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">OR Upload:</span>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0], (url) => {
                        const newFormData = { ...formData };
                        newFormData.features.image = url;
                        setFormData(newFormData);
                      });
                    }
                  }}
                  className="w-full text-sm p-1 border rounded-lg"
                />
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="animate-spin h-4 w-4" /> Uploading...
                </div>
              )}
              {formData.features.image && !uploading && (
                <div className="mt-2">
                  <img
                    src={formData.features.image}
                    alt="Features Section"
                    className="rounded-lg max-h-48 object-cover"
                  />
                </div>
              )}
            </div>
            <h3 className="font-semibold mb-2">Features List</h3>
            {formData.features.list.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleInputChange(e, "features", "list", index)
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("features", "list", index)}
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("features", "list")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Feature
            </button>
          </div>

          {/* Video Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Video Section</h2>
            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={formData.video.title}
              onChange={(e) => handleInputChange(e, "video", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              name="subtitle"
              placeholder="Video Subtitle"
              value={formData.video.subtitle}
              onChange={(e) => handleInputChange(e, "video", "subtitle")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="url"
              placeholder="Youtube Video URL"
              value={formData.video.url}
              onChange={(e) => handleInputChange(e, "video", "url")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Gallery Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Gallery Section</h2>
            {formData.gallery.images.map((item, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg mb-2 space-y-2 bg-gray-50"
              >
                <input
                  type="text"
                  placeholder="Image URL"
                  value={item.src}
                  onChange={(e) =>
                    handleInputChange(e, "gallery", "images", index, "src")
                  }
                  className="w-full p-2 border rounded"
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">OR Upload:</span>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0], (url) => {
                          const newFormData = { ...formData };
                          newFormData.gallery.images[index].src = url;
                          setFormData(newFormData);
                        });
                      }
                    }}
                    className="w-full text-sm p-1 border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Alt Text"
                  value={item.alt}
                  onChange={(e) =>
                    handleInputChange(e, "gallery", "images", index, "alt")
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("gallery", "images", index)}
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("gallery", "images")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Image
            </button>
          </div>

          {/* Specifications Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              Specifications Section
            </h2>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.specifications.title}
              onChange={(e) => handleInputChange(e, "specifications", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            {formData.specifications.list.map((item, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg mb-2 space-y-2 bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Icon Upload:</span>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0], (url) => {
                          const newFormData = { ...formData };
                          newFormData.specifications.list[index].icon = url;
                          setFormData(newFormData);
                        });
                      }
                    }}
                    className="w-full text-sm p-1 border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Specification Text"
                  value={item.text}
                  onChange={(e) =>
                    handleInputChange(
                      e,
                      "specifications",
                      "list",
                      index,
                      "text"
                    )
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("specifications", "list", index)
                  }
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("specifications", "list")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Specification
            </button>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              Why Choose Us Section
            </h2>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.whyChooseUs.title}
              onChange={(e) => handleInputChange(e, "whyChooseUs", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            {formData.whyChooseUs.list.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleInputChange(e, "whyChooseUs", "list", index)
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem("whyChooseUs", "list", index)}
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("whyChooseUs", "list")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {/* Call To Action Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">
              Call To Action Section
            </h2>
            <input
              type="text"
              name="title"
              placeholder="CTA Title"
              value={formData.callToAction.title}
              onChange={(e) => handleInputChange(e, "callToAction", "title")}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.callToAction.phone}
              onChange={(e) => handleInputChange(e, "callToAction", "phone")}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Footer Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Phone /> Footer Section
            </h2>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Footer Phone Number"
              value={formData.footer.phoneNumber}
              onChange={(e) => handleInputChange(e, "footer")}
              className="w-full p-3 border rounded-lg"
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

export default ManageTemplate1;
