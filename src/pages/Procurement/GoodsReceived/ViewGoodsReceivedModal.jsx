import React from "react";
import CustomModal from "../../../components/CustomModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ViewGoodsReceivedModal = ({ open, setOpen, goodsReceivedData }) => {
  if (!goodsReceivedData) return null;

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header="Goods Received Details"
      width="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Received Code", goodsReceivedData.receivedCode],
            ["Procurement ID", goodsReceivedData.procurementId],
            ["Seed Type", goodsReceivedData.seedType],
            ["Quantity", goodsReceivedData.receivedQuantity],
            [
              "Received Date",
              goodsReceivedData.receivedDate
                ? formatDhakaDate(goodsReceivedData.receivedDate)
                : "N/A",
            ],
            [
              "Expiry Date",
              goodsReceivedData.expiryDate
                ? formatDhakaDate(goodsReceivedData.expiryDate)
                : "N/A",
            ],
            [
              "Current Approver",
              goodsReceivedData.currentApproverRole?.value ||
                goodsReceivedData.currentApproverRole ||
                "N/A",
            ],
          ].map(([label, value], index) => (
            <div
              key={index}
              className="rounded-xl border border-primary-100 bg-primary-50/40 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
                {label}
              </p>

              <p className="mt-2 text-base font-semibold text-text break-words">
                {value || "N/A"}
              </p>
            </div>
          ))}

          <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
              Status
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                  goodsReceivedData.status === "Approved"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : goodsReceivedData.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      : goodsReceivedData.status === "Rejected"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {goodsReceivedData.status || "N/A"}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
              Notes
            </p>

            <p className="mt-2 text-base font-medium text-text whitespace-pre-wrap break-words">
              {goodsReceivedData.notes || "N/A"}
            </p>
          </div>

          {goodsReceivedData.receivedImages &&
            goodsReceivedData.receivedImages.length > 0 && (
              <div className="md:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
                  Images
                </p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {goodsReceivedData.receivedImages.map((img, index) => (
                    <a
                      key={img.id}
                      href={img.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 underline font-medium"
                    >
                      Image {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

          {goodsReceivedData.approvals &&
            goodsReceivedData.approvals.length > 0 && (
              <div className="md:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-light mb-4">
                  Approval History
                </p>
                <div className="space-y-3">
                  {goodsReceivedData.approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className="rounded-lg border border-primary-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="font-semibold text-text">
                          {approval.approver?.fullName || "N/A"}{" "}
                          <span className="text-sm font-normal text-text-light">
                            ({approval.role?.value || "N/A"})
                          </span>
                        </span>
                        <span className="text-xs font-medium text-text-light">
                          {new Date(approval.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            approval.status?.value === "Approved"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : approval.status?.value === "Rejected"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {approval.status?.value || "N/A"}
                        </span>
                        <span className="text-sm text-text-light italic">
                          {approval.remarks
                            ? `"${approval.remarks}"`
                            : "No remarks"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="flex justify-end border-t border-primary-100 pt-5">
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg bg-primary-500 px-5 py-2 text-white font-medium hover:bg-primary-600 transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewGoodsReceivedModal;
