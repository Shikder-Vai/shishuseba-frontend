import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Swal from "sweetalert2"; // Import SweetAlert2
import {
  Plus, Trash2, Loader2, Edit, ChevronDown, ChevronUp, ImageUp, Wand2, List, ShieldQuestion, Apple, HeartPulse, Phone
} from "lucide-react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAllProducts from "../../hooks/useAllProducts";
import Loader from "../../components/Loader";

// A helper component for collapsible sections
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
        <span className="flex items-center gap-3"><Icon className="text-brand-teal-base" /> {title}</span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>
      {isOpen && <div className="mt-4 pt-4 border-t">{children}</div>}
    </div>
  );
};

const ManageLandingPage = () => {
  const [formData, setFormData] = useState({
    hero: { title: "", subtitle: "" },
    featuredProductId: "",
    problemSection: { title: "", problems: [{ text: "" }] },
    ingredientsSection: { title: "", ingredients: [{ name: "", image: "" }] },
    benefitsSection: { title: "", image: "", benefits: [{ text: "" }] },
    footer: { phoneNumber: "" },
  });

  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [products, loadingProducts] = useAllProducts();

  const { data: landingPageData, isLoading: isLoadingData } = useQuery({
    queryKey: ["landingPage"],
    queryFn: async () => {
      const res = await axiosPublic.get("/landing-page");
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        setFormData({
          hero: data.hero || { title: "", subtitle: "" },
          featuredProductId: data.featuredProductId || "",
          problemSection: data.problemSection || { title: "", problems: [{ text: "" }] },
          ingredientsSection: data.ingredientsSection || { title: "", ingredients: [{ name: "", image: "" }] },
          benefitsSection: data.benefitsSection || { title: "", image: "", benefits: [{ text: "" }] },
          footer: data.footer || { phoneNumber: "" },
        });
      }
    },
    retry: false, // Don't retry on 404
  });

  const { mutate: updateLandingPage, isLoading: isSubmitting } = useMutation({
    mutationFn: (newData) => axiosPublic.post("/landing-page", newData),
    onSuccess: () => {
      toast.success("Landing page updated successfully!");
      queryClient.invalidateQueries(["landingPage"]);
    },
    onError: (error) => toast.error(error.message || "Failed to update"),
  });

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
    const newItem = field === 'ingredients' ? { name: "", image: "" } : { text: "" };
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
      text: "Do you want to save these changes to the landing page?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00897B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateLandingPage(formData);
      }
    });
  };

  if (loadingProducts || isLoadingData) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Custom Landing Page</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          <AccordionSection title="Hero Section" icon={Wand2}>
            <div className="space-y-4">
              <input type="text" name="title" placeholder="Hero Title" value={formData.hero.title} onChange={(e) => handleInputChange(e, 'hero')} className="w-full p-3 border rounded-lg" />
              <textarea name="subtitle" placeholder="Hero Subtitle" value={formData.hero.subtitle} onChange={(e) => handleInputChange(e, 'hero')} className="w-full p-3 border rounded-lg" rows="3" />
            </div>
          </AccordionSection>

          <AccordionSection title="Featured Product" icon={Apple}>
             <select name="featuredProductId" value={formData.featuredProductId} onChange={(e) => setFormData({...formData, featuredProductId: e.target.value})} className="w-full p-3 border rounded-lg" required>
                <option value="">-- Select a Product --</option>
                {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
            </select>
          </AccordionSection>

          <AccordionSection title="Problem Section" icon={ShieldQuestion}>
            <input type="text" name="title" placeholder="Section Title" value={formData.problemSection.title} onChange={(e) => handleInputChange(e, 'problemSection', 'title')} className="w-full p-3 border rounded-lg mb-4" />
            {formData.problemSection.problems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input type="text" name="text" placeholder={`Problem ${index + 1}`} value={item.text} onChange={(e) => handleInputChange(e, 'problemSection', 'problems', index)} className="w-full p-2 border rounded-lg" />
                <button type="button" onClick={() => handleRemoveItem('problemSection', 'problems', index)} className="text-red-500"><Trash2 /></button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddItem('problemSection', 'problems')} className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"><Plus size={16} /> Add Problem</button>
          </AccordionSection>

          <AccordionSection title="Ingredients Section" icon={List}>
            <input type="text" name="title" placeholder="Section Title" value={formData.ingredientsSection.title} onChange={(e) => handleInputChange(e, 'ingredientsSection', 'title')} className="w-full p-3 border rounded-lg mb-4" />
            {formData.ingredientsSection.ingredients.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 mb-2">
                <input type="text" name="name" placeholder={`Ingredient Name ${index + 1}`} value={item.name} onChange={(e) => handleInputChange(e, 'ingredientsSection', 'ingredients', index)} className="w-full p-2 border rounded-lg" />
                <input type="text" name="image" placeholder={`Image URL ${index + 1}`} value={item.image} onChange={(e) => handleInputChange(e, 'ingredientsSection', 'ingredients', index)} className="w-full p-2 border rounded-lg" />
                <button type="button" onClick={() => handleRemoveItem('ingredientsSection', 'ingredients', index)} className="text-red-500 md:col-span-2"><Trash2 /></button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddItem('ingredientsSection', 'ingredients')} className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"><Plus size={16} /> Add Ingredient</button>
          </AccordionSection>

          <AccordionSection title="Benefits Section" icon={HeartPulse}>
            <input type="text" name="title" placeholder="Section Title" value={formData.benefitsSection.title} onChange={(e) => handleInputChange(e, 'benefitsSection', 'title')} className="w-full p-3 border rounded-lg mb-4" />
            <input type="text" name="image" placeholder="Section Image URL" value={formData.benefitsSection.image} onChange={(e) => handleInputChange(e, 'benefitsSection', 'image')} className="w-full p-3 border rounded-lg mb-4" />
            {formData.benefitsSection.benefits.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input type="text" name="text" placeholder={`Benefit ${index + 1}`} value={item.text} onChange={(e) => handleInputChange(e, 'benefitsSection', 'benefits', index)} className="w-full p-2 border rounded-lg" />
                <button type="button" onClick={() => handleRemoveItem('benefitsSection', 'benefits', index)} className="text-red-500"><Trash2 /></button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddItem('benefitsSection', 'benefits')} className="mt-2 flex items-center gap-2 text-sm text-brand-teal-base"><Plus size={16} /> Add Benefit</button>
          </AccordionSection>

          <AccordionSection title="Footer Section" icon={Phone}>
             <input type="text" name="phoneNumber" placeholder="Footer Phone Number" value={formData.footer.phoneNumber} onChange={(e) => handleInputChange(e, 'footer')} className="w-full p-3 border rounded-lg" />
          </AccordionSection>

          <div className="flex justify-end pt-6 border-t">
            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-teal-base text-white font-semibold rounded-lg shadow-md hover:bg-brand-teal-dark disabled:opacity-50">
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