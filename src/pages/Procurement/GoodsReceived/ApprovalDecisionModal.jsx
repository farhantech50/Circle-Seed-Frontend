import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import useGoodsReceived from "../../../hooks/useGoodsReceived";
import useLookUp from "../../../hooks/useLookup";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";

const initialForm = {
  statusId: "",
  remarks: "",
  qcPercentage: "",
  images: [],
};

const ApprovalDecisionModal = ({ open, setOpen, requestData }) => {
  const { decideApproval, loading } = useGoodsReceived();
  const { getLookup } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [statuses, setStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      setLoadingStatuses(true);
      const res = await getLookup("receivedStatus");
      if (res.success) {
        // Exclude 'Pending' if we only want actionable statuses
        setStatuses(res.data.filter((status) => status.value !== "Pending"));
      } else {
        showToast("Failed to fetch approval statuses", "error");
      }
      setLoadingStatuses(false);
    };

    if (open) {
      fetchStatuses();
    }
  }, [open]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = null; 
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
    setSelectedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestData?.id) return;

    const result = await Swal.fire({
      title: "Submit Decision?",
      text: "Are you sure you want to submit this decision?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      let uploadedImageUrls = [];

      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          Swal.fire({
            title: "Error!",
            text: "Cloudinary credentials missing in .env file (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET).",
            icon: "error",
            confirmButtonColor: "#0D9488",
          });
          setUploadingImages(false);
          return;
        }

        try {
          const uploadPromises = selectedFiles.map(async (file) => {
            const uploadData = new FormData();
            uploadData.append("file", file);
            uploadData.append("upload_preset", uploadPreset);
            uploadData.append("folder", "Circle Seed Goods Received");

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
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to upload images.",
            icon: "error",
            confirmButtonColor: "#0D9488",
          });
          return;
        }
        setUploadingImages(false);
      }

      const payload = {
        statusId: Number(formData.statusId),
        remarks: formData.remarks,
        images: uploadedImageUrls,
      };

      if (formData.qcPercentage !== "") {
        payload.qcPercentage = Number(formData.qcPercentage);
      }

      console.log("Sending Payload to backend:", payload);

      const res = await decideApproval(requestData.id, payload);

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
      header="Take Decision"
      width="max-w-lg"
    >
      {requestData && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">Procurement ID:</span>{" "}
            {requestData.procurementId || "-"}
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">Seed Type:</span>{" "}
            {requestData.seedType || "-"}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Received Qty:</span>{" "}
            {requestData.receivedQuantity || "-"}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decision Status
            </label>
            <select
              name="statusId"
              value={formData.statusId}
              onChange={handleChange}
              required
              disabled={loadingStatuses}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" disabled>
                {loadingStatuses ? "Loading statuses..." : "Select decision..."}
              </option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Enter remarks..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              QC Percentage
            </label>
            <input
              type="number"
              name="qcPercentage"
              value={formData.qcPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              step="any"
              placeholder="e.g. 95.5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 focus:border-primary-500 focus:ring-primary-500"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden group">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 rounded-bl-lg opacity-80 transition-opacity"
                    >
                      &#10005;
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            disabled={loading || loadingStatuses || uploadingImages}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            {uploadingImages ? "Uploading..." : loading ? "Submitting..." : "Submit Decision"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default ApprovalDecisionModal;
