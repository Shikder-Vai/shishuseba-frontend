import { useMutation, useQueryClient } from "@tanstack/react-query";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useCategories from "../../hooks/useCategories";
import useProduct from "../../hooks/useProduct";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, Loader2, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { imgbbKey } from "../../hooks/useImgbb";

const UpdateProductModal = ({ onClose, productId }) => {
  const { product, isLoading: loadingProduct } = useProduct(productId);
  const [categories, loadingCategories] = useCategories();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    details: [],
    questions: [],
    dropdownQuestions: [],
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [variants, setVariants] = useState([{ weight: "", price: "" }]);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        details: product.details || [],
        questions: product.questions || [],
        dropdownQuestions: product.dropdownQuestions || [],
      });
      setVariants(product.variants || [{ weight: "", price: "" }]);
    }
  }, [product]);

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
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.[0]) {
      handleImageUpload(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddQuestion = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], { id: Date.now(), question: "", ans: "" }],
    }));
  };

  const handleQuestionChange = (index, field, value, type) => {
    setFormData((prev) => {
      const updated = [...prev[type]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [type]: updated };
    });
  };

  const handleRemoveQuestion = (index, type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleAddVariant = () => {
    setVariants([...variants, { weight: "", price: "" }]);
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

  const { mutate: updateProduct } = useMutation({
    mutationFn: async (productData) => {
      setSubmitStatus("submitting");
      const res = await axiosPublic.put(`/products/${productId}`, productData);
      return res.data;
    },
    onSuccess: () => {
      setSubmitStatus("success");
      setTimeout(() => {
        Swal.fire({
          title: "Success!",
          text: "Product updated successfully",
          icon: "success",
          confirmButtonColor: "#018b76",
          background: "#feefe0",
          color: "#333333",
          iconColor: "#018b76",
          confirmButtonText: "OK",
          customClass: {
            popup: "border-2 border-brand-teal-base",
          },
        });
        queryClient.invalidateQueries(["products"]);
        queryClient.invalidateQueries(["product", productId]);
        onClose();
      }, 1500);
    },
    onError: (error) => {
      setSubmitStatus(null);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update product",
        icon: "error",
        confirmButtonColor: "#ffa245",
        background: "#feefe0",
        color: "#333333",
        iconColor: "#ffa245",
        confirmButtonText: "Try Again",
        customClass: {
          popup: "border-2 border-brand-orange-base",
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      variants: variants.filter((v) => v.weight && v.price),
    };
    updateProduct(payload);
  };

  if (loadingProduct) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-brand-teal-base" />
          <p className="mt-4 text-lg font-medium">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!product && !loadingProduct) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <h3 className="text-xl font-bold text-red-500">Error</h3>
          <p className="mt-2">Product not found or failed to load</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-brand-teal-base text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {productId && (
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
            {submitStatus === "submitting" && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin h-12 w-12 text-brand-teal-base" />
                <p className="text-lg font-medium text-brand-gray-base">
                  Updating product...
                </p>
              </div>
            )}

            {submitStatus === "success" && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-lg font-medium text-brand-gray-base">
                  Product updated successfully!
                </p>
              </div>
            )}

            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-teal-base">
                Update Product
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 transition-colors"
                disabled={submitStatus === "submitting"}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                      name="category"
                      value={formData.category || ""}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                      required
                    >
                      <option value="">Select Category</option>
                      {!loadingCategories &&
                        categories.map((cat) => (
                          <option
                            key={cat._id}
                            value={cat.category}
                            selected={cat.category === formData.category}
                          >
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
                        Current image
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
                        onChange={(e) =>
                          handleVariantChange(index, "weight", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                        className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      disabled={variants.length <= 1}
                      className={`p-3 text-red-500 hover:text-red-700 rounded-lg ${
                        variants.length <= 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-gray-base">
                  Product Details
                </h3>
                <textarea
                  rows={5}
                  value={formData.details?.join("\n") || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      details: e.target.value.split("\n"),
                    }))
                  }
                  placeholder="Write product details, one per line."
                  className="w-full p-3 border border-brand-gray-light rounded-lg focus:ring-2 focus:ring-brand-teal-100 focus:border-brand-teal-300"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-brand-gray-base">
                    Product Q&A
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("questions")}
                    className="flex items-center gap-1 text-brand-teal-base hover:text-brand-teal-500 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Question</span>
                  </button>
                </div>

                {formData.questions?.map((qa, index) => (
                  <div
                    key={index}
                    className="p-4 border border-brand-gray-light/50 rounded-lg bg-brand-gray-light/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-brand-gray-base">
                        Question {index + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index, "questions")}
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
                          "questions"
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
                          "questions"
                        )
                      }
                      rows={3}
                      className="w-full p-2 border border-brand-gray-light/50 rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-brand-gray-base">
                    Dropdown Q&A
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("dropdownQuestions")}
                    className="flex items-center gap-1 text-brand-teal-base hover:text-brand-teal-500 text-sm font-medium"
                  >
                    <Plus size={16} />
                    <span>Add Dropdown Question</span>
                  </button>
                </div>

                {formData.dropdownQuestions?.map((qa, index) => (
                  <div
                    key={index}
                    className="p-4 border border-brand-gray-light/50 rounded-lg bg-brand-gray-light/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-brand-gray-base">
                        Dropdown Question {index + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveQuestion(index, "dropdownQuestions")
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
                          "dropdownQuestions"
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
                          "dropdownQuestions"
                        )
                      }
                      rows={3}
                      className="w-full p-2 border border-brand-gray-light/50 rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-brand-gray-light rounded-lg text-brand-gray-base hover:bg-brand-gray-light/20 transition-colors"
                  disabled={submitStatus === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || submitStatus === "submitting"}
                  className="px-6 py-2 bg-brand-teal-base text-white rounded-lg hover:bg-brand-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {submitStatus === "submitting" ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    "Update Product"
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

export default UpdateProductModal;
