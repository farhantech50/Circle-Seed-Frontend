import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import useLookUp from "../../../../hooks/useLookup";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";

const initialForm = {
  name: "",
  value: "",
};

const CreateEditLookupModal = ({ open, setOpen, lookupData, setLookupData }) => {
  const { createLookup, updateLookup, loading } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (lookupData) {
      setFormData({
        name: lookupData.name || "",
        value: lookupData.value || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [lookupData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setLookupData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: lookupData ? "Update Lookup?" : "Create Lookup?",
      text: lookupData
        ? "Do you want to update this lookup?"
        : "Do you want to create this lookup?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: lookupData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    let res;
    if (lookupData) {
      // Update logic: backend expects an object with value, isActive
      res = await updateLookup(lookupData.id, {
        value: formData.value,
        isActive: true,
      });
    } else {
      // Create logic: backend expects an array of objects with name, value
      res = await createLookup({
        name: formData.name,
        value: formData.value,
      });
    }

    if (res.success) {
      setTriggerRefresh();
      handleClose();

      Swal.fire({
        title: "Success!",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#0D9488",
      });
    } else {
      Swal.fire({
        title: "Error!",
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
      header={lookupData ? "Edit Lookup" : "Create Lookup"}
      width="w-[30vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Lookup Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!!lookupData} // Usually you can't edit the name/category of a lookup
              placeholder="e.g. tuitionPostStatus"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
            />
            {!lookupData && (
              <p className="mt-1 text-xs text-gray-500">
                Use a camelCase name for consistency, e.g., "leaveStatus".
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Lookup Value
            </label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              placeholder="e.g. pending"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-white hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading ? "Saving..." : lookupData ? "Update Lookup" : "Create Lookup"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEditLookupModal;
