import React from "react";
import ViewInvoiceModal from "../ViewInvoiceModal";

const ReceiptModal = ({ open, setOpen, orderData }) => {
  if (!open) return null;

  const targetInvoiceId =
    orderData?.invoice?.id ||
    (typeof orderData?.invoice === "number" ? orderData.invoice : null);

  return (
    <ViewInvoiceModal
      open={open}
      setOpen={setOpen}
      invoiceId={targetInvoiceId}
      orderData={orderData}
    />
  );
};

export default ReceiptModal;
