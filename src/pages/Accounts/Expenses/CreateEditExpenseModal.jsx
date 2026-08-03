import React, { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCheckCircle, FaCalendarAlt, FaTag, FaCreditCard, FaNotesMedical, FaCloudUploadAlt, FaTrash, FaImage, FaSpinner } from "react-icons/fa";
import CustomModal from "../../../components/CustomModal";
import showToast from "../../../utils/toast";
import useLookUp from "../../../hooks/useLookup";

const initialForm = {
  categoryId: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  paymentMethodId: "",
};

const CreateEditExpenseModal = ({
  open,
  setOpen,
  expenseData,
  setExpenseData,
  onSuccess,
  createExpense,
  updateExpense,
  submitting,
}) => {
  const { getLookup } = useLookUp();

  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Image Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLookups();
      if (expenseData) {
        setFormData({
          categoryId: expenseData.categoryId || expenseData.category?.id || "",
          amount: expenseData.amount || "",
          date: expenseData.date ? expenseData.date.split("T")[0] : new Date().toISOString().split("T")[0],
          description: expenseData.description || "",
          paymentMethodId: expenseData.paymentMethodId || expenseData.paymentMethod?.id || "",
        });
        const imgs = expenseData.attachments || expenseData.imageUrls || expenseData.images || [];
        const parsedUrls = Array.isArray(imgs)
          ? imgs.map((i) => (typeof i === "string" ? i : i?.imageUrl || i?.url)).filter(Boolean)
          : [];
        setExistingImageUrls(Array.from(new Set(parsedUrls)));
      } else {
        setFormData(initialForm);
        setExistingImageUrls([]);
      }
      setSelectedFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchLookups = async () => {
    setLoadingLookups(true);
    try {
      const [catRes, pmRes] = await Promise.all([
        getLookup("expense_category"),
        getLookup("payment_method"),
      ]);

      const catData = catRes.success
        ? Array.isArray(catRes.data) ? catRes.data : Array.isArray(catRes.data?.data) ? catRes.data.data : []
        : [];
      setCategories(catData);

      const pmData = pmRes.success
        ? Array.isArray(pmRes.data) ? pmRes.data : Array.isArray(pmRes.data?.data) ? pmRes.data.data : []
        : [];
      setPaymentMethods(pmData);
    } catch (err) {
      console.error("Error fetching expense lookups:", err);
    }
    setLoadingLookups(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClose = () => {
    setOpen(false);
    if (setExpenseData) setExpenseData(null);
    setFormData(initialForm);
    setSelectedFiles([]);
    setExistingImageUrls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryId) {
      showToast("Please select an expense category", "error");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      showToast("Please enter a valid expense amount", "error");
      return;
    }

    if (!formData.date) {
      showToast("Please select a date", "error");
      return;
    }

    let uploadedImageUrls = [];

    if (selectedFiles.length > 0) {
      setUploadingImages(true);
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dchx1y8g1";
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "circle_seed";

      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);
          uploadData.append("upload_preset", uploadPreset);
          uploadData.append("folder", "Circle Seed Expenses");

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: uploadData,
            }
          );

          const data = await response.json();
          if (data.secure_url) {
            return data.secure_url;
          } else {
            throw new Error(data.error?.message || "Image upload failed");
          }
        });

        uploadedImageUrls = await Promise.all(uploadPromises);
      } catch (error) {
        setUploadingImages(false);
        showToast(error.message || "Failed to upload expense images", "error");
        return;
      }
      setUploadingImages(false);
      setSelectedFiles([]);
    }

    const payload = {
      categoryId: Number(formData.categoryId),
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description.trim(),
      paymentMethodId: formData.paymentMethodId ? Number(formData.paymentMethodId) : null,
      imageUrls: uploadedImageUrls,
    };

    const res = expenseData
      ? await updateExpense(expenseData.id, payload)
      : await createExpense(payload);

    if (res.success) {
      showToast(res.message || (expenseData ? "Expense updated" : "Expense recorded"), "success");
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } else {
      showToast(res.message || "Failed to save expense", "error");
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={expenseData ? "Edit Expense Entry" : "Record New Expense"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FaTag className="text-emerald-600" /> Expense Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            disabled={loadingLookups}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
          >
            <option value="">{loadingLookups ? "Loading categories..." : "-- Select Category --"}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.value || cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaMoneyBillWave className="text-emerald-600" /> Amount (BDT) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              name="amount"
              required
              value={formData.amount}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              placeholder="e.g. 5000"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-emerald-600" /> Expense Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Payment Method (Optional/Nullable) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FaCreditCard className="text-emerald-600" /> Payment Method (Optional)
          </label>
          <select
            name="paymentMethodId"
            value={formData.paymentMethodId}
            onChange={handleChange}
            disabled={loadingLookups}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
          >
            <option value="">-- None / Select Payment Method --</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.value || pm.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FaNotesMedical className="text-emerald-600" /> Description / Remarks
          </label>
          <textarea
            rows="2"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter expense details or description..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Expense Voucher / Receipt Image Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FaImage className="text-emerald-600" />
            Upload Receipts / Voucher Images
          </label>

          <div className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-2.5 bg-slate-50 hover:bg-emerald-50/20 transition flex items-center justify-center gap-2 cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <FaCloudUploadAlt className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Click or drag images to upload</span>
            <span className="text-[10px] text-slate-400 font-normal">(PNG, JPG, WEBP)</span>
          </div>

          {/* Existing and Newly Selected Previews (Compact Scroll Box) */}
          {(existingImageUrls.length > 0 || selectedFiles.length > 0) && (
            <div className="mt-2 max-h-24 overflow-y-auto p-1.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap gap-2">
              {/* Existing Images */}
              {existingImageUrls.map((url, idx) => (
                <div key={`exist-${idx}`} className="relative group rounded-lg overflow-hidden border border-emerald-300 bg-white w-14 h-14 shrink-0 shadow-xs">
                  <img src={url} alt={`existing-${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="absolute top-0.5 right-0.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-sm"
                    title="Remove image"
                  >
                    <FaTrash className="w-2 h-2" />
                  </button>
                </div>
              ))}

              {/* Selected Files */}
              {selectedFiles.map((file, idx) => (
                <div key={`new-${idx}`} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white w-14 h-14 shrink-0 shadow-xs">
                  <img src={URL.createObjectURL(file)} alt={`new-${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-0.5 right-0.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-sm"
                    title="Remove image"
                  >
                    <FaTrash className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImages || !formData.amount || !formData.categoryId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin" /> Uploading...
              </>
            ) : submitting ? (
              "Saving..."
            ) : (
              <>
                <FaCheckCircle className="w-3.5 h-3.5" />
                {expenseData ? "Update Expense" : "Save Expense"}
              </>
            )}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEditExpenseModal;
