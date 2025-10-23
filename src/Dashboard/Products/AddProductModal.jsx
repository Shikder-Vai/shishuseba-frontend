import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const AddProductModal = ({ onClose }) => {
  const [variants, setVariants] = useState([{ sku: "", name: "", price: "", stock_quantity: "" }]);
  const [images, setImages] = useState([]);
  const [subCategories, setSubCategories] = useState([""]);
  const [ingredients, setIngredients] = useState([""]);
  const [uses, setUses] = useState([""]);
  
  const axiosPublic = useAxiosPublic();

  const updateArray = (setter) => (index, value) => setter((prev) => {
    const copy = [...prev];
    copy[index] = value;
    return copy;
  });

  const addToArray = (setter, initial = "") => () => setter((prev) => [...prev, initial]);
  const removeFromArray = (setter) => (index) => setter((prev) => prev.filter((_, i) => i !== index));

  const updateVariant = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axiosPublic.post("/v1/upload", { image: file }, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = res.data.imageUrl;
      if (imageUrl) {
        setImages((prev) => [...prev, imageUrl]);
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const product = {
      name: {
        bn: form.name_bn.value,
        en: form.name_en.value,
      },
      category: {
        main: form.category_main.value,
        sub: subCategories.filter(Boolean),
      },
      variants: variants.map(v => ({
        ...v,
        price: parseFloat(v.price),
        stock_quantity: parseInt(v.stock_quantity, 10)
      })).filter(v => v.sku && v.name && !isNaN(v.price) && !isNaN(v.stock_quantity)),
      description: {
        bn: form.description_bn.value,
        en: form.description_en.value,
      },
      ingredients: ingredients.filter(Boolean),
      uses: uses.filter(Boolean),
      images: images,
      availability: form.availability.value,
    };

    if (product.variants.length === 0) {
      alert("Please add at least one valid variant.");
      return;
    }

    try {
      const res = await axiosPublic.post("/v1/products", product);
      console.log(res);
      onClose();
    } catch (error) {
      console.error("Failed to add product:", error);
      alert(`Failed to add product: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-2 sm:px-4 md:px-8"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg"
        >
          <h2 className="text-xl font-bold mb-6 text-center">Add New Product</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name_bn" placeholder="Product Name (Bangla)" className="input input-bordered w-full" required />
              <input name="name_en" placeholder="Product Name (English)" className="input input-bordered w-full" required />
            </div>

            <input name="category_main" placeholder="Main Category" className="input input-bordered w-full" required />

            <label className="block mt-2 font-medium">Sub Categories:</label>
            <div className="space-y-2">
              {subCategories.map((item, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-center">
                  <input value={item} onChange={(e) => updateArray(setSubCategories)(i, e.target.value)} className="input input-bordered flex-1 min-w-[150px]" />
                  <button type="button" onClick={() => removeFromArray(setSubCategories)(i)} className="btn btn-sm btn-warning">✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addToArray(setSubCategories)} className="btn btn-sm btn-outline">+ Add Subcategory</button>

            <label className="mt-2 font-medium">Variants:</label>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                  <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="SKU" className="input input-bordered w-full" required />
                  <input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} placeholder="Variant Name" className="input input-bordered w-full" required />
                  <input value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} placeholder="Price" className="input input-bordered w-full" type="number" required />
                  <input value={v.stock_quantity} onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)} placeholder="Stock" className="input input-bordered w-full" type="number" required />
                  <button type="button" onClick={() => removeFromArray(setVariants)(i)} className="btn btn-sm btn-warning col-span-2 md:col-span-1">✕ Remove</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addToArray(setVariants, { sku: "", name: "", price: "", stock_quantity: "" })} className="btn btn-sm btn-outline">+ Add Variant</button>

            <textarea name="description_bn" placeholder="Description (Bangla)" className="textarea textarea-bordered w-full" />
            <textarea name="description_en" placeholder="Description (English)" className="textarea textarea-bordered w-full" />

            <div>
              <label className="block font-medium mb-1">Ingredients:</label>
              <div className="space-y-2">
                {ingredients.map((item, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center">
                    <input value={item} onChange={(e) => updateArray(setIngredients)(i, e.target.value)} className="input input-bordered flex-1 min-w-[150px]" />
                    <button type="button" onClick={() => removeFromArray(setIngredients)(i)} className="btn btn-sm btn-warning">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addToArray(setIngredients)} className="btn btn-sm btn-outline mt-2">+ Add Ingredient</button>
            </div>

            <div>
              <label className="block font-medium mb-1">Uses:</label>
              <div className="space-y-2">
                {uses.map((item, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-center">
                    <input value={item} onChange={(e) => updateArray(setUses)(i, e.target.value)} className="input input-bordered flex-1 min-w-[150px]" />
                    <button type="button" onClick={() => removeFromArray(setUses)(i)} className="btn btn-sm btn-warning">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addToArray(setUses)} className="btn btn-sm btn-outline mt-2">+ Add Use</button>
            </div>

            <div>
              <label className="block font-medium mb-1">Images:</label>
              <div className="space-y-2">
                {images.map((url, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <img src={url} alt="Preview" className="w-16 h-16 object-cover border rounded" />
                    <button type="button" onClick={() => removeFromArray(setImages)(i)} className="btn btn-sm btn-warning">✕</button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input file-input-bordered w-full mt-2" />
            </div>

            <div className="mt-2">
              <label className="font-medium">Availability:</label>
              <select name="availability" className="select select-bordered w-full mt-1">
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <button type="button" className="btn w-full sm:w-auto" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-success w-full sm:w-auto">Save Product</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddProductModal;