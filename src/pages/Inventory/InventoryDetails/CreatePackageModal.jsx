import { useState, useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useInventory from "../../../hooks/useInventory";
import useLookUp from "../../../hooks/useLookup";
import showToast from "../../../utils/toast";

const initialForm = {
  bulkInventoryId: "",
  packetSizeId: "",
  quantity: "",
  unitPrice: "",
};

const CreatePackageModal = ({ open, setOpen, onSuccess, seedTypeId }) => {
  const { createPackage, getBatchIds, loading } = useInventory();
  const { getLookup } = useLookUp();
  const [formData, setFormData] = useState(initialForm);
  const [packetSizes, setPacketSizes] = useState([]);
  const [batchIds, setBatchIds] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingSizes(true);
      setLoadingBatches(true);

      const [resSizes, resBatches] = await Promise.all([
        getLookup("packetSize"),
        getBatchIds(seedTypeId)
      ]);

      if (resSizes.success) setPacketSizes(resSizes.data || []);
      
      if (resBatches.success) {
        const bIds = resBatches.data?.data || resBatches.data || [];
        setBatchIds(bIds);
      }

      setLoadingSizes(false);
      setLoadingBatches(false);
    };

    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      bulkInventoryId: Number(formData.bulkInventoryId),
      packetSizeId: Number(formData.packetSizeId),
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
    };

    const res = await createPackage(payload);

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
      header="Create Package"
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulk Inventory (Batch ID)
            </label>
            <select
              name="bulkInventoryId"
              value={formData.bulkInventoryId}
              onChange={handleChange}
              required
              disabled={loadingBatches}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" disabled>
                {loadingBatches ? "Loading..." : "Select Batch ID"}
              </option>
              {batchIds.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packet Size (gram)
            </label>
            <select
              name="packetSizeId"
              value={formData.packetSizeId}
              onChange={handleChange}
              required
              disabled={loadingSizes}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" disabled>
                {loadingSizes ? "Loading..." : "Select Packet Size"}
              </option>
              {packetSizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (Pcs)
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g. 50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
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
              placeholder="e.g. 150"
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
            {loading ? "Submitting..." : "Create Package"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreatePackageModal;
