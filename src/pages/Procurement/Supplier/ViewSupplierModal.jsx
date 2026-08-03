import CustomModal from "../../../components/CustomModal";

const ViewSupplierModal = ({ open, setOpen, supplier }) => {
  if (!supplier) return null;

  const data = [
    { label: "Stakeholder ID", value: supplier.stakeholderId || supplier.supplierId },
    { label: "Stakeholder Type", value: supplier.stakeholderType },
    { label: "Stakeholder Name", value: supplier.name },
    { label: "Company Name", value: supplier.companyName },
    { label: "Contact", value: supplier.contact },
    { label: "Email", value: supplier.email },
    { label: "NID Number", value: supplier.nidNumber },
    { label: "Country", value: supplier.country },
    { label: "Bank Name", value: supplier.bankName },
    { label: "Branch Name", value: supplier.branchName },
    { label: "Account Name", value: supplier.accountName },
    { label: "Account Number", value: supplier.accountNumber },
    { label: "Routing Number", value: supplier.routingNumber },
    { label: "SWIFT Code", value: supplier.swiftCode },
    { label: "Commission Percentage", value: supplier.commissionPercentage !== undefined && supplier.commissionPercentage !== null ? `${supplier.commissionPercentage}%` : "N/A" },
  ];

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Stakeholder Details"
      width="w-[50vw]"
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
                  supplier.isActive
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {supplier.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-light">
              Address
            </p>

            <p className="mt-2 text-base font-medium text-text whitespace-pre-wrap break-words">
              {supplier.address || "N/A"}
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

export default ViewSupplierModal;
