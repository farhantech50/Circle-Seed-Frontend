import { useState, useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useInventory from "../../../hooks/useInventory";
import showToast from "../../../utils/toast";

const initialForm = {
  unitPrice: "",
  expiryDate: "",
};

const EditBulkModal = ({ open, setOpen, rowData, onSuccess }) => {
  const { updateBulkInventory, loading } = useInventory();
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (open && rowData) {
      setFormData({
        unitPrice: rowData.unitPrice || "",
        expiryDate: rowData.expiryDate ? rowData.expiryDate.split("T")[0] : "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [open, rowData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rowData?.id) return;

    const payload = {
      unitPrice: Number(formData.unitPrice),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
    };

    const res = await updateBulkInventory(rowData.id, payload);
    if (res.success) {
      showToast(res.message, "success");
      onSuccess();
      handleClose();
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Edit Bulk Inventory"
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch ID
            </label>
            <input
              type="text"
              value={rowData?.batchId || ""}
              disabled
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (BDT)
            </label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              required
              min="0"
              step="any"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default EditBulkModal;
