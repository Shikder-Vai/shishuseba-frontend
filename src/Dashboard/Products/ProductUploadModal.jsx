import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Loader2, CheckCircle } from "lucide-react";
import useCategories from "../../hooks/useCategories";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { imgbbKey } from "../../hooks/useImgbb";

const ProductUploadModal = ({ isOpen, onClose }) => {
  const [categories, loadingCategories] = useCategories();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  // Form state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({ details: [] });
  const [detailInput, setDetailInput] = useState("");
  const [questions, setQuestions] = useState([{ id: 1, question: "", ans: "" }]);
  const [dropdownQuestions, setDropdownQuestions] = useState([{ id: 1, question: "", ans: "" }]);
  const [variants, setVariants] = useState([{ weight: '', price: '' }]);

  // Loading states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'submitting', 'success', null

  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    const selected = categories.find((cat) => cat.en === categoryName);
    setSelectedCategory(selected?._id || "");
    setFormData((prev) => ({ ...prev, category: categoryName }));
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    const form = new FormData();
    form.append("image", file);
    setUploadingImage(true);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbKey}`,
        { method: "POST", body: form }
      );
      const data = await res.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, image: data.data.url }));
        toast.success("Image uploaded successfully");
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Image upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files?.[0]) {
      handleImageUpload(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle details management
  const handleAddDetail = () => {
    if (detailInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        details: [...prev.details, detailInput],
      }));
      setDetailInput("");
    }
  };

  // Handle questions management
  const handleAddQuestion = (setter) => {
    setter((prev) => [
      ...prev,
      { id: Date.now(), question: "", ans: "" },
    ]);
  };

  const handleQuestionChange = (index, key, value, setter) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleRemoveQuestion = (index, setter) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle variants management
  const handleAddVariant = () => {
    setVariants([...variants, { weight: '', price: '' }]);
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length > 1) {
      const updatedVariants = variants.filter((_, i) => i !== index);
      setVariants(updatedVariants);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedCategory("");
    setFormData({ details: [] });
    setDetailInput("");
    setQuestions([{ id: 1, question: "", ans: "" }]);
    setDropdownQuestions([{ id: 1, question: "", ans: "" }]);
    setVariants([{ weight: '', price: '' }]);
    setSubmitStatus(null);
  };

  // Submit product
  const { mutate: postProduct } = useMutation({
    mutationFn: async (product) => {
      setSubmitStatus('submitting');
      const res = await axiosPublic.post("/products", product);
      return res.data;
    },
    onSuccess: () => {
      setSubmitStatus('success');
      setTimeout(() => {
        toast.success("Product added successfully");
        queryClient.invalidateQueries(["products"]);
        resetForm();
        onClose();
      }, 1500);
    },
    onError: (error) => {
      setSubmitStatus(null);
      toast.error(error.message || "Failed to add product");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const categoryObj = categories.find((cat) => cat._id === selectedCategory);
    
    const payload = {
      ...formData,
      category: categoryObj?.category || formData.category || "",
      questions: questions.filter((q) => q.question && q.ans),
      dropdownQuestions: dropdownQuestions.filter((q) => q.question && q.ans),
      variants: variants.filter(v => v.weight && v.price),
    };

    postProduct(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            {/* Loading overlay */}
            {submitStatus === 'submitting' && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin h-12 w-12 text-brand-teal-base" />
                <p className="text-lg font-medium text-brand-gray-base">
                  Uploading product...
                </p>
              </div>
            )}

            {/* Success overlay */}
            {submitStatus === 'success' && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-lg font-medium text-brand-gray-base">
                  Product uploaded successfully!
                </p>
              </div>
            )}

            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-teal-base">
                Upload New Product
              </h2>
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="text-gray-500 hover:text-red-600 transition-colors"
                disabled={submitStatus === 'submitting'}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-brand-gray-base">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-base mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category || ""}
                      onChange={handleCategoryChange}
                      className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                      required
                    >
                      <option value="">Select Category</option>
                      {!loadingCategories &&
                        categories.map((cat) => (
                          <option key={cat._id} value={cat.en}>
                            {cat.en}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray-base mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      className="w-full p-2 border border-brand-gray-light rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-teal-50 file:text-brand-teal-base hover:file:bg-brand-teal-100"
                      accept="image/*"
                      required
                    />
                    {uploadingImage && (
                      <div className="mt-2 text-sm text-brand-gray-base/70 flex items-center gap-2">
                        <Loader2 className="animate-spin h-4 w-4" />
                        Uploading image...
                      </div>
                    )}
                    {formData.image && !uploadingImage && (
                      <div className="mt-2 text-sm text-brand-teal-base flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Image uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray-base mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      placeholder="Product SKU"
                      value={formData.sku || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray-base mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Product Name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray-base mb-1">
                    Stock Status
                  </label>
                  <select
                    name="stock"
                    value={formData.stock || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                    required
                  >
                    <option value="">Select Stock Status</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Variant Weights & Prices */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-brand-gray-base">
                    Variant Weights & Prices
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="flex items-center gap-1 text-brand-teal-base hover:text-brand-teal-500 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Variant</span>
                  </button>
                </div>

                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border border-brand-gray-light/50 rounded-lg bg-brand-gray-light/10"
                  >
                    <div>
                      <label className="block text-sm font-medium text-brand-gray-base mb-1">
                        Weight/Size
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 500g, 1L"
                        value={variant.weight}
                        onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                        className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-gray-base mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      disabled={variants.length <= 1}
                      className={`p-3 text-red-500 hover:text-red-700 rounded-lg ${variants.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-gray-base">
                  Product Details
                </h3>
                
                <div className="flex gap-2">
                  <textarea
                    rows={1}
                    value={detailInput}
                    onChange={(e) => setDetailInput(e.target.value)}
                    placeholder="Write product detail"
                    className="flex-1 p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddDetail}
                    className="flex items-center gap-1 bg-brand-teal-base text-white px-4 py-3 rounded-lg hover:bg-brand-teal-500 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>

                {formData.details.length > 0 && (
                  <ul className="space-y-2 pl-5 list-disc text-brand-gray-base">
                    {formData.details.map((detail, index) => (
                      <li key={index} className="flex justify-between items-start">
                        <span>{detail}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              details: prev.details.filter((_, i) => i !== index),
                            }))
                          }
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Questions & Answers */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-brand-gray-base">
                    Product Q&A
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(setQuestions)}
                    className="flex items-center gap-1 text-brand-teal-base hover:text-brand-teal-500 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((qa, index) => (
                  <div
                    key={qa.id}
                    className="p-4 border border-brand-gray-light/50 rounded-lg bg-brand-gray-light/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-brand-gray-base">
                        Question {index + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index, setQuestions)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter question"
                      value={qa.question}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "question",
                          e.target.value,
                          setQuestions
                        )
                      }
                      className="w-full p-2 mb-2 border border-brand-gray-light/50 rounded"
                    />
                    <textarea
                      placeholder="Enter answer"
                      value={qa.ans}
                      onChange={(e) =>
                        handleQuestionChange(index, "ans", e.target.value, setQuestions)
                      }
                      rows={3}
                      className="w-full p-2 border border-brand-gray-light/50 rounded"
                    />
                  </div>
                ))}
              </div>

              {/* Dropdown Q&A */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-brand-gray-base">
                    Dropdown Q&A
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion(setDropdownQuestions)}
                    className="flex items-center gap-1 text-brand-teal-base hover:text-brand-teal-500 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Dropdown Question</span>
                  </button>
                </div>

                {dropdownQuestions.map((qa, index) => (
                  <div
                    key={qa.id}
                    className="p-4 border border-brand-gray-light/50 rounded-lg bg-brand-gray-light/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-brand-gray-base">
                        Dropdown Question {index + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveQuestion(index, setDropdownQuestions)
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter question"
                      value={qa.question}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "question",
                          e.target.value,
                          setDropdownQuestions
                        )
                      }
                      className="w-full p-2 mb-2 border border-brand-gray-light/50 rounded"
                    />
                    <textarea
                      placeholder="Enter answer"
                      value={qa.ans}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "ans",
                          e.target.value,
                          setDropdownQuestions
                        )
                      }
                      rows={3}
                      className="w-full p-2 border border-brand-gray-light/50 rounded"
                    />
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { resetForm(); onClose(); }}
                  className="px-6 py-2 border border-brand-gray-light rounded-lg text-brand-gray-base hover:bg-brand-gray-light/20 transition-colors"
                  disabled={submitStatus === 'submitting'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || submitStatus === 'submitting'}
                  className="px-6 py-2 bg-brand-teal-base text-white rounded-lg hover:bg-brand-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {submitStatus === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Product"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductUploadModal;