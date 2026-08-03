import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import usePOSLocation from "../../../../hooks/usePOSLocation";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";

const initialForm = {
  name: "",
  address: "",
  contact: "",
  isActive: true,
};

const CreatePOSModal = ({ open, setOpen, locationData, setLocationData }) => {
  const { createPOSLocation, updatePOSLocation, loading } = usePOSLocation();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (locationData) {
      setFormData({
        name: locationData.name || "",
        address: locationData.address || "",
        contact: locationData.contact || "",
        isActive: locationData.isActive !== undefined ? locationData.isActive : true,
      });
    } else {
      setFormData(initialForm);
    }
  }, [locationData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setLocationData(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: locationData ? "Update POS Location?" : "Create POS Location?",
      text: locationData
        ? "Do you want to update this POS location?"
        : "Do you want to create this POS location?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: locationData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        contact: formData.contact,
        ...(locationData && { isActive: formData.isActive }),
      };

      const res = locationData
        ? await updatePOSLocation(locationData.id, payload)
        : await createPOSLocation(payload);

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
          text: res.message || "Operation failed.",
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={locationData ? "Edit POS Location" : "Create POS Location"}
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              POS Location Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Uttara Outlet"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Full address of the outlet..."
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g. 01700000000"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {locationData && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Location
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-button-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : locationData
              ? "Update Location"
              : "Create Location"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreatePOSModal;
