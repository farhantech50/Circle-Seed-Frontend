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
  typeId: 30,
  seedTypeId: "",
  orderedQuantity: "",
  unitPrice: "",
  orderDate: "",
  expectedDeliveryDate: "",
  otherCharges: "",
  originCountry: "",
  lcNumber: "",
  portOfEntry: "",
  shippingCost: "",
  customsDuty: "",
  notes: "",
};

const CreateImportModal = ({
  open,
  setOpen,
  importData,
  setImportData,
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
      const res = await api.get("/api/stakeholders/type/30");
      let items = res.data;
      if (items?.success) items = items.data;
      if (items?.data) items = items.data;
      
      setSuppliers(Array.isArray(items) ? items : Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch stakeholders", error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    if (importData) {
      setFormData({
        stakeholderId: importData.stakeholderId || importData.supplierId || "",
        typeId: 30,
        seedTypeId: importData.seedTypeId || "",
        orderedQuantity: importData.orderedQuantity || "",
        unitPrice: importData.unitPrice || "",
        orderDate: importData.orderDate ? importData.orderDate.split("T")[0] : "",
        expectedDeliveryDate: importData.expectedDeliveryDate ? importData.expectedDeliveryDate.split("T")[0] : "",
        otherCharges: importData.otherCharges || "",
        originCountry: importData.originCountry || "",
        lcNumber: importData.lcNumber || "",
        portOfEntry: importData.portOfEntry || "",
        shippingCost: importData.shippingCost || "",
        customsDuty: importData.customsDuty || "",
        notes: importData.notes || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [importData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    if (setImportData) setImportData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: importData ? "Update Import?" : "Create Import?",
      text: importData
        ? "Do you want to update this import?"
        : "Do you want to create this import?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: importData ? "Yes, Update" : "Yes, Create",
    });

    if (!result.isConfirmed) return;

    // Convert numeric and ID fields to proper types
    const payload = {
      ...formData,
      stakeholderId: formData.stakeholderId ? parseInt(formData.stakeholderId, 10) : null,
      typeId: 30,
      seedTypeId: formData.seedTypeId ? parseInt(formData.seedTypeId, 10) : null,
      orderedQuantity: formData.orderedQuantity ? Number(formData.orderedQuantity) : 0,
      unitPrice: formData.unitPrice ? Number(formData.unitPrice) : 0,
      otherCharges: formData.otherCharges ? Number(formData.otherCharges) : 0,
      shippingCost: formData.shippingCost ? Number(formData.shippingCost) : null,
      customsDuty: formData.customsDuty ? Number(formData.customsDuty) : null,
      orderDate: formData.orderDate ? new Date(formData.orderDate).toISOString() : null,
      expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : null,
    };

    const res = importData
      ? await updatePreOrder(importData.id, payload)
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
      header={importData ? "Edit Import" : "Create Import"}
      width="w-[70vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              selectedId={30}
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
            <label className="block mb-2 text-sm font-medium">Origin Country</label>
            <input
              name="originCountry"
              type="text"
              value={formData.originCountry}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">LC Number</label>
            <input
              name="lcNumber"
              type="text"
              value={formData.lcNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Port of Entry</label>
            <input
              name="portOfEntry"
              type="text"
              value={formData.portOfEntry}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Shipping Cost (BDT)</label>
            <input
              name="shippingCost"
              type="number"
              step="any"
              value={formData.shippingCost}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Customs Duty (BDT)</label>
            <input
              name="customsDuty"
              type="number"
              step="any"
              value={formData.customsDuty}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Other Charges (BDT)</label>
            <input
              name="otherCharges"
              type="number"
              step="any"
              value={formData.otherCharges}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-3">
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
            {loading ? "Saving..." : importData ? "Update Import" : "Create Import"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateImportModal;
