import { useState } from "react";
import CustomModal from "../../../components/CustomModal";

const ViewDamageLossModal = ({ open, setOpen, adjustmentData }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!adjustmentData) return null;

  const rawImages = adjustmentData.images || adjustmentData.imageUrls || adjustmentData.attachments || [];
  const imageUrls = Array.from(
    new Set(
      (Array.isArray(rawImages)
        ? rawImages.map((img) => (typeof img === "string" ? img : img.imageUrl || img.url)).filter(Boolean)
        : [])
    )
  );

  return (
    <>
      <CustomModal
        open={open}
        setOpen={setOpen}
        header="Damage/Loss Details"
        width="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Date
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {adjustmentData.dateFormatted}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Source Type
              </h4>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {adjustmentData.sourceTypeFormatted}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Inventory Ref
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {adjustmentData.inventoryRef}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Seed Type
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {adjustmentData.seedType}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Reason
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {adjustmentData.reason}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Quantity
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {adjustmentData.quantity} {adjustmentData.sourceType === "bulk" ? "Kg" : "Pcs"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Reported By
              </h4>
              <p className="text-sm font-medium text-gray-900">
                {adjustmentData.reportedBy || "N/A"}
              </p>
            </div>

            {/* Images Box next to Reported By */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Images {imageUrls.length > 0 ? `(${imageUrls.length})` : ""}
              </h4>
              {imageUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(url)}
                      className="group flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-lg hover:border-primary-500 transition shadow-sm text-left"
                    >
                      <img
                        src={url}
                        alt={`Image ${idx + 1}`}
                        className="w-10 h-10 object-cover rounded border border-gray-100"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-800 group-hover:text-primary-600 transition">
                          Image {idx + 1}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Click to view
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-500">No images attached</p>
              )}
            </div>

            {/* Notes full width */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Notes
              </h4>
              <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                {adjustmentData.notes || "No additional notes provided."}
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </CustomModal>

      {/* Image Preview Modal */}
      {selectedImage && (
        <CustomModal
          open={!!selectedImage}
          setOpen={() => setSelectedImage(null)}
          header="Image Preview"
          width="max-w-3xl"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="max-h-[70vh] overflow-hidden rounded-lg border border-gray-200 bg-black/5 flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt="Preview Full"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-md"
              />
            </div>
            <div className="flex justify-between w-full items-center border-t pt-3">
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-800 font-medium underline flex items-center gap-1"
              >
                Open Original in New Tab
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default ViewDamageLossModal;
