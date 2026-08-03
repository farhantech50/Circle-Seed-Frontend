import CustomModal from "../../../components/CustomModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ViewLocalPurchaseModal = ({ open, setOpen, localPurchaseData }) => {
  if (!localPurchaseData) return null;

  const data = [
    { label: "Procurement ID", value: localPurchaseData.procurementId },
    { label: "Supplier", value: localPurchaseData.supplier?.name },
    { label: "Supplier Code", value: localPurchaseData.supplier?.supplierId },
    { label: "Supplier Type", value: localPurchaseData.type?.value },
    { label: "Seed Type", value: localPurchaseData.seedType },
    { label: "Quantity (KG)", value: localPurchaseData.orderedQuantity },
    { label: "Received Quantity (KG)", value: localPurchaseData.receivedQuantity },
    { label: "Unit Price (BDT)", value: localPurchaseData.unitPrice },
    { label: "Total Amount", value: localPurchaseData.totalAmount },
    {
      label: "Order Date",
      value: localPurchaseData.orderDate
        ? formatDhakaDate(localPurchaseData.orderDate)
        : "N/A",
    },
    {
      label: "Expected Delivery Date",
      value: localPurchaseData.expectedDeliveryDate
        ? formatDhakaDate(localPurchaseData.expectedDeliveryDate)
        : "N/A",
    },
    { label: "Other Charges (BDT)", value: localPurchaseData.otherCharges },
  ];

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header="Local Purchase Details"
      width="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-primary-100 bg-primary-50/40 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
                {item.label}
              </p>

              <p className="mt-2 text-base font-semibold text-text break-words">
                {item.value || "N/A"}
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
                  localPurchaseData.status?.value === "Approved"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : localPurchaseData.status?.value === "Pending"
                    ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    : localPurchaseData.status?.value === "Rejected"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {localPurchaseData.status?.value || "N/A"}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
              Notes
            </p>

            <p className="mt-2 text-base font-medium text-text whitespace-pre-wrap break-words">
              {localPurchaseData.notes || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-primary-100 pt-5">
          <button
            type="button"
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

export default ViewLocalPurchaseModal;
