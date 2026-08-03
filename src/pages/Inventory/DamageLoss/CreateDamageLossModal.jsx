import { useState, useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useInventoryAdjustment from "../../../hooks/useInventoryAdjustment";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import useLookUp from "../../../hooks/useLookup";
import SearchableSelect from "../../../components/SearchableSelect";

const initialForm = {
  sourceType: "bulk", // 'bulk' or 'packaged'
  bulkInventoryId: "",
  packagedInventoryId: "",
  reasonId: "",
  quantity: "",
  notes: "",
};

const CreateDamageLossModal = ({ open, setOpen, adjustmentData }) => {
  const { createAdjustment, updateAdjustment, getBatchIds, getPackagedIds, loading } = useInventoryAdjustment();
  const { getLookup } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [reasons, setReasons] = useState([]);
  const [bulkOptions, setBulkOptions] = useState([]);
  const [packagedOptions, setPackagedOptions] = useState([]);

  // Image Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLookups();
      fetchInventoryOptions();
    }
  }, [open]);

  useEffect(() => {
    if (adjustmentData && open) {
      setFormData({
        sourceType: adjustmentData.bulkInventoryId ? "bulk" : adjustmentData.packagedInventoryId ? "packaged" : adjustmentData.sourceType || "bulk",
        bulkInventoryId: adjustmentData.bulkInventoryId || "",
        packagedInventoryId: adjustmentData.packagedInventoryId || "",
        reasonId: adjustmentData.reasonId || "",
        quantity: adjustmentData.quantity || "",
        notes: adjustmentData.notes || "",
      });
      const imgs = adjustmentData.imageUrls || adjustmentData.images || adjustmentData.attachments || [];
      const parsedUrls = Array.isArray(imgs) ? imgs.map(i => typeof i === 'string' ? i : i?.imageUrl || i?.url).filter(Boolean) : [];
      setExistingImageUrls(Array.from(new Set(parsedUrls)));
    } else {
      setFormData(initialForm);
      setExistingImageUrls([]);
    }
    setSelectedFiles([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchLookups = async () => {
    const res = await getLookup("inventoryAdjustmentReason");
    if (res.success) {
      setReasons(res.data || []);
    }
  };

  const fetchInventoryOptions = async () => {
    const [resBulk, resPackaged] = await Promise.all([
      getBatchIds(),
      getPackagedIds()
    ]);
    
    // Parse bulk options safely
    if (resBulk.success) {
      const bData = resBulk.data?.data || resBulk.data;
      setBulkOptions(Array.isArray(bData) ? bData : []);
    } else {
      setBulkOptions([]);
    }

    // Parse packaged options safely
    if (resPackaged.success) {
      let arr = [];
      const pData = resPackaged.data?.data || resPackaged.data;
      if (Array.isArray(pData)) {
        arr = pData;
      } else if (pData && typeof pData === 'object') {
        Object.values(pData).forEach(st => {
          if (st.packages && Array.isArray(st.packages)) {
            arr.push(...st.packages);
          } else if (Array.isArray(st)) {
            arr.push(...st);
          }
        });
      }
      setPackagedOptions(arr);
    } else {
      setPackagedOptions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when changing source type
      ...(name === "sourceType" && {
        bulkInventoryId: "",
        packagedInventoryId: "",
      })
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveExistingUrl = (indexToRemove) => {
    setExistingImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
    setSelectedFiles([]);
    setExistingImageUrls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedImageUrls = [];

    if (selectedFiles.length > 0) {
      setUploadingImages(true);
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        showToast("Cloudinary credentials missing in .env file", "error");
        setUploadingImages(false);
        return;
      }

      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);
          uploadData.append("upload_preset", uploadPreset);
          uploadData.append("folder", "Circle Seed Damage Loss");

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
        showToast(error.message || "Failed to upload images", "error");
        return;
      }
      setUploadingImages(false);
      setSelectedFiles([]);
    }

    const payload = {
      reasonId: Number(formData.reasonId) || formData.reasonId,
      quantity: Number(formData.quantity) || formData.quantity,
      notes: formData.notes || "",
      imageUrls: uploadedImageUrls,
    };

    if (formData.sourceType === "bulk") {
      payload.bulkInventoryId = Number(formData.bulkInventoryId) || formData.bulkInventoryId;
      payload.packagedInventoryId = null;
    } else {
      payload.bulkInventoryId = null;
      payload.packagedInventoryId = Number(formData.packagedInventoryId) || formData.packagedInventoryId;
    }

    let res;
    if (adjustmentData?.id) {
      res = await updateAdjustment(adjustmentData.id, payload);
    } else {
      res = await createAdjustment(payload);
    }

    if (res.success) {
      showToast(res.message, "success");
      setTriggerRefresh();
      handleClose();
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={adjustmentData ? "Edit Damage/Loss" : "Create Damage/Loss"}
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Source Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Type
            </label>
            <select
              name="sourceType"
              value={formData.sourceType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="bulk">Bulk Inventory</option>
              <option value="packaged">Packaged Inventory</option>
            </select>
          </div>

          {/* Inventory Selection based on Source Type */}
          {formData.sourceType === "bulk" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Bulk Batch
              </label>
              <SearchableSelect
                options={bulkOptions}
                value={formData.bulkInventoryId}
                onChange={(val) => setFormData((prev) => ({ ...prev, bulkInventoryId: val }))}
                getOptionLabel={(opt) => `${opt.batchId} ${opt.seedType?.value ? `(${opt.seedType.value})` : ""}`}
                getOptionValue={(opt) => opt.id}
                placeholder="Select Batch..."
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Packaged Inventory
              </label>
              <SearchableSelect
                options={packagedOptions}
                value={formData.packagedInventoryId}
                onChange={(val) => setFormData((prev) => ({ ...prev, packagedInventoryId: val }))}
                getOptionLabel={(opt) => {
                   const seedType = opt.seedType?.value || opt.bulkInventory?.seedType?.value || "N/A";
                   const size = opt.packetSize?.value ? `${opt.packetSize.value}g` : "N/A";
                   return `Pkg ID: ${opt.id} - ${seedType} (${size})`;
                }}
                getOptionValue={(opt) => opt.id}
                placeholder="Select Package..."
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <SearchableSelect
              options={reasons}
              value={formData.reasonId}
              onChange={(val) => setFormData((prev) => ({ ...prev, reasonId: val }))}
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
              placeholder="Select Reason..."
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity {formData.sourceType === "bulk" ? "(Kg)" : "(Pcs)"}
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Enter quantity"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Enter details..."
            />
          </div>

          {/* Upload Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />

            {(existingImageUrls.length > 0 || selectedFiles.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-3">
                {/* Existing Images */}
                {existingImageUrls.map((url, idx) => (
                  <div key={`exist-${idx}`} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                    <img 
                      src={url} 
                      alt="existing preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingUrl(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 rounded-bl-lg opacity-90 transition-opacity"
                    >
                      &#10005;
                    </button>
                  </div>
                ))}

                {/* Newly selected files */}
                {selectedFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="new file preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 rounded-bl-lg opacity-90 transition-opacity"
                    >
                      &#10005;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="px-4 py-2 text-sm font-medium text-white bg-button-primary rounded-lg hover:bg-button-primary-hover disabled:opacity-50"
          >
            {uploadingImages ? "Uploading Images..." : loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateDamageLossModal;
