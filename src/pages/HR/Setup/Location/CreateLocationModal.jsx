import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../../components/CustomModal";
import useOfficeLocation from "../../../../hooks/useOfficeLocation";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";

const initialForm = {
  name: "",
  latitude: "",
  longitude: "",
  radiusMeters: "",
};

const CreateLocationModal = ({
  open,
  setOpen,
  locationData,
  setLocationData,
}) => {
  const { createOfficeLocation, updateOfficeLocation, loading } =
    useOfficeLocation();

  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (locationData) {
      setFormData({
        name: locationData.name || "",
        latitude: locationData.latitude ?? "",
        longitude: locationData.longitude ?? "",
        radiusMeters: locationData.radiusMeters ?? "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [locationData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "latitude" || name === "longitude" || name === "radiusMeters"
          ? value === ""
            ? ""
            : Number(value)
          : value,
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
      title: locationData
        ? "Update Office Location?"
        : "Create Office Location?",
      text: locationData
        ? "Do you want to update this office location?"
        : "Do you want to create this office location?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: locationData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = locationData
        ? await updateOfficeLocation(locationData.id, formData)
        : await createOfficeLocation(formData);

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
      header={locationData ? "Edit Office Location" : "Create Office Location"}
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>

            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>

            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (Meters)
            </label>

            <input
              type="number"
              name="radiusMeters"
              value={formData.radiusMeters}
              onChange={handleChange}
              required
              min={1}
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
            {loading
              ? "Saving..."
              : locationData
                ? "Update Office Location"
                : "Create Office Location"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateLocationModal;
