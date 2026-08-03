import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Lookup from "../../../components/Lookup";
import usePreOrder from "../../../hooks/usePreOrder";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import api from "../../../config/api";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";

const initialForm = {
  stakeholderId: "",
  typeId: 29,
  seedTypeId: "",
  orderedQuantity: "",
  unitPrice: "",
  orderDate: "",
  expectedDeliveryDate: "",
  otherCharges: "",
  notes: "",
};

const CreatePreOrderModal = ({
  open,
  setOpen,
  preOrderData,
  setPreOrderData,
}) => {
  const { createPreOrder, updatePreOrder, loading } = usePreOrder();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/api/stakeholders/type/29");
      let items = res.data;
      if (items?.success) items = items.data;
      if (items?.data) items = items.data;
      
      setSuppliers(Array.isArray(items) ? items : Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch suppliers by type 29", error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    if (preOrderData) {
      setFormData({
        stakeholderId: preOrderData.stakeholderId || preOrderData.supplierId || "",
        typeId: 29,
        seedTypeId: preOrderData.seedTypeId || "",
        orderedQuantity: preOrderData.orderedQuantity || "",
        unitPrice: preOrderData.unitPrice || "",
        orderDate: preOrderData.orderDate ? preOrderData.orderDate.split("T")[0] : "",
        expectedDeliveryDate: preOrderData.expectedDeliveryDate ? preOrderData.expectedDeliveryDate.split("T")[0] : "",
        otherCharges: preOrderData.otherCharges || "",
        notes: preOrderData.notes || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [preOrderData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setPreOrderData) setPreOrderData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: preOrderData ? "Update Pre-Order?" : "Create Pre-Order?",
      text: preOrderData
        ? "Do you want to update this pre-order?"
        : "Do you want to create this pre-order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: preOrderData ? "Yes, Update" : "Yes, Create",
    });

    if (!result.isConfirmed) return;

    // Convert numeric and ID fields to proper types
    const payload = {
      ...formData,
      stakeholderId: formData.stakeholderId ? parseInt(formData.stakeholderId, 10) : null,
      typeId: 29,
      seedTypeId: formData.seedTypeId ? parseInt(formData.seedTypeId, 10) : null,
      orderedQuantity: formData.orderedQuantity ? Number(formData.orderedQuantity) : 0,
      unitPrice: formData.unitPrice ? Number(formData.unitPrice) : 0,
      otherCharges: formData.otherCharges ? Number(formData.otherCharges) : 0,
      orderDate: formData.orderDate ? new Date(formData.orderDate).toISOString() : null,
      expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : null,
    };

    const res = preOrderData
      ? await updatePreOrder(preOrderData.id, payload)
      : await createPreOrder(payload);

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
      header={preOrderData ? "Edit Pre-Order" : "Create Pre-Order"}
      width="w-[60vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-medium">Stakeholder</label>
            <SearchableSelect
              options={suppliers}
              value={formData.stakeholderId}
              onChange={(val) => setFormData((prev) => ({ ...prev, stakeholderId: val }))}
              placeholder="Select Stakeholder..."
              searchPlaceholder="Search..."
              getOptionLabel={(opt) => `${opt.name} ${opt.companyName ? `(${opt.companyName})` : ""}`}
              getOptionValue={(opt) => opt.id}
              
            />
          </div>

          <div className="pointer-events-none opacity-60">
            <label className="block mb-2 text-sm font-medium">Type (Stakeholder Type)</label>
            <Lookup
              lookupName="stakeholderType"
              selectedId={29}
              setSelectedId={() => {}}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Seed Type</label>
            <Lookup
              lookupName="seed_type"
              selectedId={formData.seedTypeId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  seedTypeId: id,
                }))
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Quantity (KG)</label>
            <input
              name="orderedQuantity"
              type="number"
              step="any"
              value={formData.orderedQuantity}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Unit Price (BDT)</label>
            <input
              name="unitPrice"
              type="number"
              step="any"
              value={formData.unitPrice}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Order Date</label>
            <input
              name="orderDate"
              type="date"
              value={formData.orderDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Expected Delivery Date</label>
            <input
              name="expectedDeliveryDate"
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Other Charges(BDT)</label>
            <input
              name="otherCharges"
              type="number"
              step="any"
              value={formData.otherCharges}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">Notes</label>
            <textarea
              rows={2}
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
            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Saving..." : preOrderData ? "Update Pre-Order" : "Create Pre-Order"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreatePreOrderModal;

