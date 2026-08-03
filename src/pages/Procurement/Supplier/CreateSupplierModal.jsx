import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Lookup from "../../../components/Lookup";
import useSupplier from "../../../hooks/useSupplier";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import CustomModal from "../../../components/CustomModal";

const initialForm = {
  stakeholderTypeId: "",
  name: "",
  companyName: "",
  contact: "",
  email: "",
  address: "",
  nidNumber: "",
  country: "Bangladesh",
  bankName: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  routingNumber: "",
  swiftCode: "",
  commissionPercentage: "",
  isActive: true,
};

const CreateSupplierModal = ({
  open,
  setOpen,
  supplierData,
  setSupplierData,
}) => {
  const { createSupplier, updateSupplier, loading } = useSupplier();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (supplierData) {
      setFormData({
        stakeholderTypeId: supplierData.stakeholderTypeId || supplierData.supplierTypeId || "",
        name: supplierData.name || "",
        companyName: supplierData.companyName || "",
        contact: supplierData.contact || "",
        email: supplierData.email || "",
        address: supplierData.address || "",
        nidNumber: supplierData.nidNumber || "",
        country: supplierData.country || "Bangladesh",
        bankName: supplierData.bankName || "",
        branchName: supplierData.branchName || "",
        accountName: supplierData.accountName || "",
        accountNumber: supplierData.accountNumber || "",
        routingNumber: supplierData.routingNumber || "",
        swiftCode: supplierData.swiftCode || "",
        commissionPercentage: supplierData.commissionPercentage !== undefined && supplierData.commissionPercentage !== null ? supplierData.commissionPercentage : "",
        isActive: supplierData.isActive,
      });
    } else {
      setFormData(initialForm);
    }
  }, [supplierData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setSupplierData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: supplierData ? "Update Stakeholder?" : "Create Stakeholder?",
      text: supplierData
        ? "Do you want to update this stakeholder?"
        : "Do you want to create this stakeholder?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: supplierData ? "Yes, Update" : "Yes, Create",
    });

    if (!result.isConfirmed) return;

    const payload = {
      ...formData,
      stakeholderTypeId: formData.stakeholderTypeId ? parseInt(formData.stakeholderTypeId, 10) : null,
      commissionPercentage: formData.commissionPercentage !== "" && formData.commissionPercentage !== null && formData.commissionPercentage !== undefined
        ? Number(formData.commissionPercentage)
        : null,
    };

    const res = supplierData
      ? await updateSupplier(supplierData.id, payload)
      : await createSupplier(payload);

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
      header={supplierData ? "Edit Stakeholder" : "Create Stakeholder"}
      width="w-[60vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Stakeholder Type
            </label>
            <Lookup
              lookupName="stakeholderType"
              selectedId={formData.stakeholderTypeId}
              setSelectedId={(id) =>
                setFormData((prev) => ({
                  ...prev,
                  stakeholderTypeId: id,
                }))
              }
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Stakeholder Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Company Name
            </label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Contact</label>
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Country</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">Address</label>
            <textarea
              rows={2}
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">NID Number</label>
            <input
              name="nidNumber"
              value={formData.nidNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Bank Name</label>
            <input
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Branch Name
            </label>
            <input
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Account Name
            </label>
            <input
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Account Number
            </label>
            <input
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Routing Number
            </label>
            <input
              name="routingNumber"
              value={formData.routingNumber}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Swift Code</label>
            <input
              name="swiftCode"
              value={formData.swiftCode}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Commission Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="any"
              name="commissionPercentage"
              value={formData.commissionPercentage}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
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
            {loading
              ? "Saving..."
              : supplierData
                ? "Update Stakeholder"
                : "Create Stakeholder"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateSupplierModal;
