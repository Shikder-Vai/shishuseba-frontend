import { useMutation, useQueryClient } from "@tanstack/react-query";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useProduct from "../../hooks/useProduct";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, Loader2, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import useCategories from "../../hooks/useCategories";

const ProductModal = ({ onClose, productId }) => {
  const { product, isLoading: loadingProduct } = useProduct(productId);
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [categories] = useCategories();

  const [formData, setFormData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const isEditMode = !!productId;

  useEffect(() => {
    if (isEditMode && product) {
      const isOldStructure = typeof product.name === "string";
      let variants = product.variants;
      if (!variants || variants.length === 0) {
        variants = [
          {
            weight: product.weight || "Default",
            sku: product.sku || `temp-sku-${product._id}`,
            price: product.price || 0,
            stock_quantity: product.stock_quantity || 0,
          },
        ];
      }
      setFormData({
        name: isOldStructure
          ? product?.name
          : product.name.en + product.name.bn,
        category: product.category || "",
        variants: variants,
        description: product.description || { bn: "", en: "" },
        ingredients: product.ingredients || [],
        uses: product.uses || [],
        images: product.images || (product.image ? [product.image] : []),
        availability: product.availability || "in_stock",
        details: (product.details || []).join("\n"),
        questions: product.questions || [],
        dropdownQuestions: product.dropdownQuestions || [],
      });
    } else if (!isEditMode) {
      setFormData({
        name: "",
        category: "",
        variants: [{ weight: "", sku: "", price: "", stock_quantity: "" }],
        description: { en: "", bn: "" },
        ingredients: [],
        uses: [],
        images: [],
        availability: "in_stock",
        details: "",
        questions: [],
        dropdownQuestions: [],
      });
    }
  }, [product, isEditMode, productId]);

  // console.log(product);
  const handleImageUpload = async (file) => {
    const form = new FormData();
    form.append("image", file);
    setUploadingImage(true);
    try {
      const res = await axiosPublic.post("/upload/product-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data.imageUrl;
      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
        toast.success("Image uploaded successfully");
      } else {
        throw new Error("Image upload failed");
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
    } else if (name.includes(".")) {
      const [object, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [object]: { ...prev[object], [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { weight: "", sku: "", price: "", stock_quantity: "" },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length > 1) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, variants: updatedVariants }));
    }
  };

  const handleAddQuestion = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], { id: Date.now(), question: "", ans: "" }],
    }));
  };

  const handleQuestionChange = (index, key, value, field) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [field]: updated };
    });
  };

  const handleRemoveQuestion = (index, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const { mutate: saveProduct } = useMutation({
    mutationFn: async (productData) => {
      setSubmitStatus("submitting");
      if (isEditMode) {
        return await axiosPublic.put(`/products/${productId}`, productData);
      } else {
        return await axiosPublic.post("/products", productData);
      }
    },
    onSuccess: () => {
      setSubmitStatus("success");
      setTimeout(() => {
        Swal.fire(
          "Success!",
          `Product ${isEditMode ? "updated" : "added"} successfully`,
          "success"
        );
        queryClient.invalidateQueries(["products"]);
        if (isEditMode) queryClient.invalidateQueries(["product", productId]);
        onClose();
      }, 1500);
    },
    onError: (error) => {
      setSubmitStatus(null);
      Swal.fire(
        "Error!",
        error.response?.data?.error ||
          `Failed to ${isEditMode ? "update" : "add"} product`,
        "error"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      details: formData.details.split("\n").filter((d) => d.trim() !== ""),
      variants: formData.variants
        .map((v) => ({
          ...v,
          price: parseFloat(v.price),
          stock_quantity: parseInt(v.stock_quantity, 10),
        }))
        .filter(
          (v) =>
            v.weight && v.sku && !isNaN(v.price) && !isNaN(v.stock_quantity)
        ),
    };
    if (payload.variants.length === 0) {
      alert("Please add at least one valid variant.");
      return;
    }
    saveProduct(payload);
  };

  if ((isEditMode && loadingProduct) || !formData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-brand-teal-base" />
          <p className="mt-4 text-lg font-medium">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
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
          {submitStatus && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center gap-3">
              {submitStatus === "submitting" ? (
                <Loader2 className="animate-spin h-12 w-12 text-brand-teal-base" />
              ) : (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
              <p className="text-lg font-medium text-brand-gray-base">
                {submitStatus === "submitting"
                  ? `Saving Product...`
                  : `Product ${isEditMode ? "Updated" : "Added"}!`}
              </p>
            </div>
          )}
          <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-20">
            <h2 className="text-2xl font-bold text-brand-teal-base">
              {isEditMode ? "Update Product" : "Add New Product"}
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
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Product Name"
              className="input input-bordered w-full"
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.category}>
                  {cat.en}
                </option>
              ))}
            </select>
            <div>
              <label className="block text-sm font-medium text-brand-gray-base mb-1">
                Product Images
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt="product"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => i !== idx),
                        }))
                      }
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                </label>
              </div>
            </div>
            <label className="mt-2 font-medium">Variants:</label>
            <div className="space-y-2">
              {formData.variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                >
                  <input
                    value={v.weight}
                    onChange={(e) =>
                      handleVariantChange(i, "weight", e.target.value)
                    }
                    placeholder="WEIGHT"
                    className="input input-bordered w-full"
                    required
                  />
                  <input
                    value={v.sku}
                    onChange={(e) =>
                      handleVariantChange(i, "sku", e.target.value)
                    }
                    placeholder="SKU"
                    className="input input-bordered w-full"
                    required
                  />
                  <input
                    value={v.price}
                    onChange={(e) =>
                      handleVariantChange(i, "price", e.target.value)
                    }
                    placeholder="Price"
                    className="input input-bordered w-full"
                    type="number"
                    required
                  />
                  <input
                    value={v.stock_quantity}
                    onChange={(e) =>
                      handleVariantChange(i, "stock_quantity", e.target.value)
                    }
                    placeholder="Stock"
                    className="input input-bordered w-full"
                    type="number"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(i)}
                    className="btn btn-sm btn-warning"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="btn btn-sm btn-outline"
            >
              + Add Variant
            </button>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="Enter product details, one per line."
                className="textarea textarea-bordered w-full"
                rows={4}
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Product Q&A</h3>
                <button
                  type="button"
                  onClick={() => handleAddQuestion("questions")}
                  className="btn btn-sm btn-outline"
                >
                  + Add Question
                </button>
              </div>
              {formData.questions.map((qa, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <label>Question {index + 1}</label>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index, "questions")}
                      className="text-red-500"
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
                    className="input input-bordered w-full mb-2"
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
                    className="textarea textarea-bordered w-full"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Dropdown Q&A</h3>
                <button
                  type="button"
                  onClick={() => handleAddQuestion("dropdownQuestions")}
                  className="btn btn-sm btn-outline"
                >
                  + Add Dropdown
                </button>
              </div>
              {formData.dropdownQuestions.map((qa, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <label>Dropdown {index + 1}</label>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveQuestion(index, "dropdownQuestions")
                      }
                      className="text-red-500"
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
                    className="input input-bordered w-full mb-2"
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
                    className="textarea textarea-bordered w-full"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded-lg"
                disabled={submitStatus === "submitting"}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage || submitStatus === "submitting"}
                className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
              >
                {submitStatus === "submitting" ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;
