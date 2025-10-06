import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  Plus,
  Trash2,
  Loader2,
  Edit,
  ChevronDown,
  ChevronUp,
  Wand2,
  List,
  ShieldQuestion,
  Apple,
  HeartPulse,
  Phone,
} from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAllProducts from "../../hooks/useAllProducts";
import Loader from "../../components/Loader";
import { imgbbKey } from "../../hooks/useImgbb";

const AccordionSection = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = icon;
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold text-gray-700"
      >
        <span className="flex items-center gap-3">
          <Icon className="text-brand-teal-base" /> {title}
        </span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>
      {isOpen && <div className="mt-4 pt-4 border-t">{children}</div>}
    </div>
  );
};

const ManageLandingPage = () => {
  // =================================================================
  // 1. ALL HOOKS MUST BE DECLARED AT THE TOP, IN THE SAME ORDER
  // =================================================================
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== "new";

  const [formData, setFormData] = useState({
    name: "",
    hero: { title: "", subtitle: "" },
    featuredProductId: "",
    problemSection: { title: "", problems: [{ text: "" }] },
    ingredientsSection: { title: "", ingredients: [{ name: "", image: "" }] },
    benefitsSection: { title: "", image: "", benefits: [{ text: "" }] },
    footer: { phoneNumber: "" },
  });
  const [uploading, setUploading] = useState(false);

  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [products, loadingProducts] = useAllProducts();

  const {
    data,
    error,
    isLoading: isLoadingData,
  } = useQuery({
    queryKey: ["landingPage", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/landing-pages/${id}`);
      return res.data;
    },
    enabled: isEditMode,
  });

  // This is the combined mutation hook. It is now correctly placed at the top.
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
      setFormData({
        name: data?.name || "",
        hero: data?.hero || { title: "", subtitle: "" },
        featuredProductId: data?.featuredProductId || "",
        problemSection: data?.problemSection || {
          title: "",
          problems: [{ text: "" }],
        },
        ingredientsSection: data.ingredientsSection || {
          title: "",
          ingredients: [{ name: "", image: "" }],
        },
        benefitsSection: data.benefitsSection || {
          title: "",
          image: "",
          benefits: [{ text: "" }],
        },
        footer: data.footer || { phoneNumber: "" },
      });
    }
  }, [data]);

  const handleImageUpload = async (file, onSuccess) => {
    const form = new FormData();
    form.append("image", file);
    setUploading(true);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (data.success) {
        onSuccess(data.data.url);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // =================================================================
  // 2. EARLY RETURNS AND LOGIC CAN COME AFTER ALL HOOKS ARE DECLARED
  // =================================================================
  if (loadingProducts || (isEditMode && isLoadingData)) {
    return <Loader />;
  }

  if (error) {
    return <div>Error fetching landing page data: {error.message}</div>;
  }

  // Helper functions
  const handleInputChange = (e, section, field, index = null) => {
    const { name, value } = e.target;
    const newFormData = { ...formData };

    if (index !== null) {
      newFormData[section][field][index][name] = value;
    } else if (field) {
      newFormData[section][field] = value;
    } else {
      newFormData[section] = { ...newFormData[section], [name]: value };
    }

    setFormData(newFormData);
  };

  const handleAddItem = (section, field) => {
    const newItem =
      field === "ingredients" ? { name: "", image: "" } : { text: "" };
    const newFormData = { ...formData };
    newFormData[section][field].push(newItem);
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
      confirmButtonText: `Yes, ${isEditMode ? "save it" : "create it"}!`,
    }).then((result) => {
      if (result.isConfirmed) {
        saveLandingPage(formData);
      }
    });
  };

  // =================================================================
  // 3. THE FINAL RENDER / JSX RETURN
  // =================================================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {isEditMode ? "Edit Landing Page" : "Create New Landing Page"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <label className="text-lg font-semibold text-gray-700">
              Page Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Summer Sale"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 border rounded-lg mt-2"
              required
            />
          </div>

          <AccordionSection title="Hero Section" icon={Wand2}>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Hero Title"
                value={formData.hero.title}
                onChange={(e) => handleInputChange(e, "hero")}
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                name="subtitle"
                placeholder="Hero Subtitle"
                value={formData.hero.subtitle}
                onChange={(e) => handleInputChange(e, "hero")}
                className="w-full p-3 border rounded-lg"
                rows="3"
              />
            </div>
          </AccordionSection>

          <AccordionSection title="Featured Product" icon={Apple}>
            <select
              name="featuredProductId"
              value={formData.featuredProductId}
              onChange={(e) =>
                setFormData({ ...formData, featuredProductId: e.target.value })
              }
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">-- Select a Product --</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </AccordionSection>

          <AccordionSection title="Problem Section" icon={ShieldQuestion}>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.problemSection.title}
              onChange={(e) => handleInputChange(e, "problemSection", "title")}
              className="w-full p-3 border rounded-lg mb-4"
            />
            {formData.problemSection.problems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  name="text"
                  placeholder={`Problem ${index + 1}`}
                  value={item.text}
                  onChange={(e) =>
                    handleInputChange(e, "problemSection", "problems", index)
                  }
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("problemSection", "problems", index)
                  }
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("problemSection", "problems")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Problem
            </button>
          </AccordionSection>

          <AccordionSection title="Ingredients Section" icon={List}>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.ingredientsSection.title}
              onChange={(e) =>
                handleInputChange(e, "ingredientsSection", "title")
              }
              className="w-full p-3 border rounded-lg mb-4"
            />
            {formData.ingredientsSection.ingredients.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg mb-2 space-y-2 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="name"
                      placeholder={`Ingredient Name ${index + 1}`}
                      value={item.name}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "ingredientsSection",
                          "ingredients",
                          index
                        )
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      name="image"
                      placeholder={`Image URL ${index + 1}`}
                      value={item.image}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          "ingredientsSection",
                          "ingredients",
                          index
                        )
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">OR Upload:</span>
                    <input
                        type="file"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                handleImageUpload(e.target.files[0], (url) => {
                                    const newFormData = { ...formData };
                                    newFormData.ingredientsSection.ingredients[index].image = url;
                                    setFormData(newFormData);
                                });
                            }
                        }}
                        className="w-full text-sm p-1 border rounded-lg"
                    />
                </div>
                {item.image && <img src={item.image} alt={item.name} className="w-24 h-24 mt-2 rounded object-cover" />}
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("ingredientsSection", "ingredients", index)
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("ingredientsSection", "ingredients")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Ingredient
            </button>
          </AccordionSection>

          <AccordionSection title="Benefits Section" icon={HeartPulse}>
            <input
              type="text"
              name="title"
              placeholder="Section Title"
              value={formData.benefitsSection.title}
              onChange={(e) => handleInputChange(e, "benefitsSection", "title")}
              className="w-full p-3 border rounded-lg mb-4"
            />
            <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                    Section Image
                </label>
                <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                    <input
                        type="text"
                        name="image"
                        placeholder="Enter Image URL"
                        value={formData.benefitsSection.image}
                        onChange={(e) => handleInputChange(e, "benefitsSection", "image")}
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
                                        newFormData.benefitsSection.image = url;
                                        setFormData(newFormData);
                                    });
                                }
                            }}
                            className="w-full text-sm p-1 border rounded-lg"
                        />
                    </div>
                    {uploading && <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin h-4 w-4" /> Uploading...</div>}
                    {formData.benefitsSection.image && !uploading && (
                        <div className="mt-2">
                            <img src={formData.benefitsSection.image} alt="Benefits Section" className="rounded-lg max-h-48 object-cover" />
                        </div>
                    )}
                </div>
            </div>
            {formData.benefitsSection.benefits.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  name="text"
                  placeholder={`Benefit ${index + 1}`}
                  value={item.text}
                  onChange={(e) =>
                    handleInputChange(e, "benefitsSection", "benefits", index)
                  }
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("benefitsSection", "benefits", index)
                  }
                  className="text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem("benefitsSection", "benefits")}
              className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"
            >
              <Plus size={16} /> Add Benefit
            </button>
          </AccordionSection>

          <AccordionSection title="Footer Section" icon={Phone}>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Footer Phone Number"
              value={formData.footer.phoneNumber}
              onChange={(e) => handleInputChange(e, "footer")}
              className="w-full p-3 border rounded-lg"
            />
          </AccordionSection>

          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={isSaving || uploading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-teal-base text-white font-semibold rounded-lg shadow-md hover:bg-brand-teal-dark disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Edit />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageLandingPage;