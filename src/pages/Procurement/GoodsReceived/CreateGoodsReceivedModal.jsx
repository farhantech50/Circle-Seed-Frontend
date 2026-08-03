import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";
import useGoodsReceived from "../../../hooks/useGoodsReceived";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import api from "../../../config/api";

const initialForm = {
  procurementOrderId: "",
  receivedQuantity: "",
  receivedDate: "",
  expiryDate: "",
  notes: "",
};

const CreateGoodsReceivedModal = ({
  open,
  setOpen,
  goodsReceivedData,
  setGoodsReceivedData,
}) => {
  const { createGoodsReceived, updateGoodsReceived, getProcurements, loading } = useGoodsReceived();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [procurements, setProcurements] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [procurementsLoading, setProcurementsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (goodsReceivedData) {
      let procOrderId = goodsReceivedData.procurementOrderId || goodsReceivedData.procurementOrder?.id || goodsReceivedData.procurement?.id;
      if (!procOrderId && goodsReceivedData.procurementId && procurements.length > 0) {
        const found = procurements.find(
          (p) => p.procurementId === goodsReceivedData.procurementId || p.id == goodsReceivedData.procurementId
        );
        if (found) procOrderId = found.id;
      }
      if (!procOrderId) procOrderId = goodsReceivedData.procurementId || "";

      setFormData({
        procurementOrderId: procOrderId,
        receivedQuantity: goodsReceivedData.receivedQuantity ?? "",
        receivedDate: goodsReceivedData.receivedDate ? goodsReceivedData.receivedDate.split("T")[0] : "",
        expiryDate: goodsReceivedData.expiryDate ? goodsReceivedData.expiryDate.split("T")[0] : "",
        notes: goodsReceivedData.notes || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [open, goodsReceivedData, procurements]);

  const fetchData = async () => {
    setProcurementsLoading(true);
    try {
      const [res, stkRes] = await Promise.all([
        getProcurements(),
        api.get("/api/stakeholders")
      ]);
      
      if (res.success) {
        setProcurements(res.data);
      } else {
        setProcurements([]);
      }

      if (stkRes.data?.data) {
        setStakeholders(stkRes.data.data);
      } else if (Array.isArray(stkRes.data)) {
        setStakeholders(stkRes.data);
      }
    } catch (err) {
      console.error(err);
    }
    setProcurementsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setGoodsReceivedData) setGoodsReceivedData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: goodsReceivedData ? "Update Goods Received?" : "Receive Goods?",
      text: goodsReceivedData ? "Do you want to update this goods received entry?" : "Do you want to submit this goods received entry?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: goodsReceivedData ? "Yes, Update" : "Yes, Submit",
    });

    if (!result.isConfirmed) return;

    let procOrderId = formData.procurementOrderId;
    if (procOrderId && (typeof procOrderId === "string" && (procOrderId.startsWith("PRC") || isNaN(Number(procOrderId))))) {
      const found = procurements.find((p) => p.procurementId === procOrderId || p.id == procOrderId);
      if (found) procOrderId = found.id;
    }

    const payload = {
      procurementOrderId: Number(procOrderId),
      receivedQuantity: Number(formData.receivedQuantity),
      receivedDate: formData.receivedDate ? formData.receivedDate : null,
      notes: formData.notes || "",
    };

    if (formData.expiryDate) {
      payload.expiryDate = formData.expiryDate;
    }

    const res = goodsReceivedData
      ? await updateGoodsReceived(goodsReceivedData.id, payload)
      : await createGoodsReceived(payload);

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#0D9488",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: res.message,
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={goodsReceivedData ? "Edit Received Goods" : "Receive Goods"}
      width="w-[50vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">
              Procurement Order
            </label>
            <SearchableSelect
              options={procurements}
              value={formData.procurementOrderId}
              onChange={(val) => setFormData((prev) => ({ ...prev, procurementOrderId: val }))}
              getOptionLabel={(proc) => {
                const st = stakeholders.find((s) => s.id === proc.stakeholderId || s.id === proc.supplierId);
                const name = st?.name || proc.stakeholderName || proc.supplierName || proc.name || proc.supplier?.name || proc.stakeholder?.name || "";
                const company = st?.companyName || proc.companyName || proc.supplier?.companyName || proc.stakeholder?.companyName || "";
                const seedType = proc.seedTypeName || proc.seedType?.value || (typeof proc.seedType === 'string' ? proc.seedType : "");
                
                let label = proc.procurementId || "Unknown PRC";
                if (name && company && name !== company) {
                  label += ` - ${name} (${company})`;
                } else if (name || company) {
                  label += ` - ${name || company}`;
                }
                
                if (seedType) {
                  label += ` - ${seedType}`;
                }
                
                return label;
              }}
              getOptionValue={(proc) => proc.id}
              placeholder={procurementsLoading ? "Loading..." : "Select Procurement Order"}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Received Quantity
            </label>
            <input
              type="number"
              name="receivedQuantity"
              value={formData.receivedQuantity}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Received Date
            </label>
            <input
              type="date"
              name="receivedDate"
              value={formData.receivedDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">Notes</label>
            <textarea
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Saving..." : goodsReceivedData ? "Update Goods" : "Receive Goods"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateGoodsReceivedModal;
