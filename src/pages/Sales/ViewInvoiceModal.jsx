import React, { useState, useEffect, useRef } from "react";
import { FaPrint, FaSeedling, FaFileInvoiceDollar, FaUser, FaHistory, FaExternalLinkAlt, FaExpand, FaImage } from "react-icons/fa";
import CustomModal from "../../components/CustomModal";
import api from "../../config/api";
import { formatDhakaDateTime } from "../../utils/dateUtils";

const ViewInvoiceModal = ({ open, setOpen, invoiceId, orderData }) => {
  const printRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);

  useEffect(() => {
    if (open) {
      fetchInvoiceDetails();
    } else {
      setInvoice(null);
    }
  }, [open, invoiceId, orderData]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      let params = null;

      // Extract explicit direct invoice numeric ID if provided
      let directInvoiceId = null;
      if (typeof invoiceId === "number") {
        directInvoiceId = invoiceId;
      } else if (typeof invoiceId === "string") {
        const match = invoiceId.match(/\d+/);
        if (match) directInvoiceId = parseInt(match[0], 10);
      } else if (typeof orderData?.invoice?.id === "number") {
        directInvoiceId = orderData.invoice.id;
      }

      // 1. Direct numeric invoiceId prop passed explicitly (e.g. from AllInvoices or PartialInvoices)
      if (directInvoiceId) {
        params = { id: directInvoiceId };
      }
      // 2. OrderData has explicit bulkSaleId (number)
      else if (typeof orderData?.bulkSaleId === "number") {
        params = { bulkSaleId: orderData.bulkSaleId };
      }
      // 3. OrderData has explicit packagedSaleId (number)
      else if (typeof orderData?.packagedSaleId === "number") {
        params = { packagedSaleId: orderData.packagedSaleId };
      }
      // 4. OrderData has explicit posOrderId (number)
      else if (typeof orderData?.posOrderId === "number") {
        params = { posOrderId: orderData.posOrderId };
      }
      // 5. OrderData is a Bulk Sale by formatted string (e.g. BSL-0022)
      else if (typeof orderData?.saleId === "string" && orderData.saleId.toUpperCase().includes("BSL")) {
        const match = orderData.saleId.match(/\d+/);
        if (match) params = { bulkSaleId: parseInt(match[0], 10) };
      }
      // 6. OrderData is a Packaged Sale by formatted string (e.g. PSL-0017)
      else if (typeof orderData?.saleId === "string" && orderData.saleId.toUpperCase().includes("PSL")) {
        const match = orderData.saleId.match(/\d+/);
        if (match) params = { packagedSaleId: parseInt(match[0], 10) };
      }
      // 7. OrderData is a POS Order by formatted string (e.g. POS-0010)
      else if (typeof orderData?.posId === "string" && orderData.posId.toUpperCase().includes("POS")) {
        const match = orderData.posId.match(/\d+/);
        if (match) params = { posOrderId: parseInt(match[0], 10) };
      }
      // 8. Generic numeric ID fallback
      else if (typeof orderData?.id === "number") {
        params = { id: orderData.id };
      }

      if (!params) {
        setLoading(false);
        return;
      }

      const res = await api.get("/api/sales/invoices", { params }).catch(() => null);
      let data = res?.data?.data || res?.data;

      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }

      if (data && typeof data === "object") {
        setInvoice(data);
      }
    } catch (error) {
      // Smooth fallback to orderData
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Merge fetched invoice with orderData while preserving commission and nested details
  const activeInvoice = {
    ...(orderData || {}),
    ...(invoice || {}),
    commission:
      invoice?.commission ||
      orderData?.commission ||
      orderData?.invoice?.commission ||
      invoice?.bulkSale?.commission ||
      orderData?.bulkSale?.commission ||
      invoice?.packagedSale?.commission ||
      orderData?.packagedSale?.commission,
  };

  // Preserve deep objects from orderData if they are missing in the fetched invoice
  if (!activeInvoice.bulkSale && orderData?.bulkSale) activeInvoice.bulkSale = orderData.bulkSale;
  if (!activeInvoice.packagedSale && orderData?.packagedSale) activeInvoice.packagedSale = orderData.packagedSale;
  if (!activeInvoice.posOrder && orderData?.posOrder) activeInvoice.posOrder = orderData.posOrder;
  if (!activeInvoice.stakeholder && orderData?.stakeholder) activeInvoice.stakeholder = orderData.stakeholder;
  if (!activeInvoice.items && orderData?.items) activeInvoice.items = orderData.items;

  const invoiceNo =
    activeInvoice.invoiceId ||
    activeInvoice.invoiceNo ||
    activeInvoice.invoice?.invoiceId ||
    (activeInvoice.id ? `INV-${String(activeInvoice.id).padStart(4, "0")}` : "-");

  const orderType =
    activeInvoice.orderType ||
    (activeInvoice.bulkSale ? "bulk" : activeInvoice.packagedSale ? "packaged" : activeInvoice.posOrder ? "pos" : "bulk");

  const orderNo =
    activeInvoice.bulkSale?.saleId ||
    activeInvoice.packagedSale?.saleId ||
    activeInvoice.posOrder?.posId ||
    activeInvoice.orderNumber ||
    activeInvoice.saleId ||
    activeInvoice.orderNo ||
    "-";

  const statusVal =
    typeof activeInvoice.status === "object" && activeInvoice.status?.value
      ? activeInvoice.status.value
      : typeof activeInvoice.invoice?.status === "object" && activeInvoice.invoice?.status?.value
        ? activeInvoice.invoice.status.value
        : typeof activeInvoice.status === "string"
          ? activeInvoice.status
          : activeInvoice.invoiceStatus || "Paid";

  const dateStr = activeInvoice.createdAt
    ? formatDhakaDateTime(activeInvoice.createdAt)
    : activeInvoice.date
      ? formatDhakaDateTime(activeInvoice.date)
      : "-";

  const createdBy =
    activeInvoice.createdBy?.fullName ||
    (activeInvoice.createdBy?.employeeId ? `Employee #${activeInvoice.createdBy.employeeId}` : "") ||
    activeInvoice.cashierName ||
    "Sales Executive";

  const posLocationName =
    activeInvoice.location?.name ||
    activeInvoice.posOrder?.location?.name ||
    activeInvoice.locationName ||
    activeInvoice.posLocation?.name ||
    "";

  // Stakeholder / Customer Info
  const stakeholderObj =
    activeInvoice.bulkSale?.stakeholder ||
    activeInvoice.packagedSale?.stakeholder ||
    activeInvoice.stakeholder ||
    {};

  const customerName =
    stakeholderObj.name ||
    activeInvoice.stakeholderName ||
    activeInvoice.posOrder?.customerName ||
    activeInvoice.customerName ||
    activeInvoice.customer ||
    "Walk-in Customer";

  const companyName = stakeholderObj.companyName || "-";
  const contact =
    stakeholderObj.contact ||
    stakeholderObj.phone ||
    activeInvoice.posOrder?.customerContact ||
    activeInvoice.customerContact ||
    activeInvoice.contact ||
    "-";
  const address = stakeholderObj.address || "-";

  // Items List Extraction
  let items = [];
  if (activeInvoice.bulkSale?.items && Array.isArray(activeInvoice.bulkSale.items)) {
    items = activeInvoice.bulkSale.items;
  } else if (activeInvoice.packagedSale?.items && Array.isArray(activeInvoice.packagedSale.items)) {
    items = activeInvoice.packagedSale.items;
  } else if (activeInvoice.posOrder?.items && Array.isArray(activeInvoice.posOrder.items)) {
    items = activeInvoice.posOrder.items;
  } else if (Array.isArray(activeInvoice.items)) {
    items = activeInvoice.items;
  } else if (Array.isArray(activeInvoice.bulkSaleItems)) {
    items = activeInvoice.bulkSaleItems;
  } else if (Array.isArray(activeInvoice.packagedSaleItems)) {
    items = activeInvoice.packagedSaleItems;
  }

  // Financial Amounts directly from API
  const subtotal = Number(
    activeInvoice.subtotal ||
    activeInvoice.bulkSale?.subtotal ||
    activeInvoice.packagedSale?.subtotal ||
    0
  );

  const discountType =
    activeInvoice.discountType ||
    activeInvoice.bulkSale?.discountType ||
    activeInvoice.packagedSale?.discountType ||
    "flat";

  const discountValue = Number(
    activeInvoice.discountValue ||
    activeInvoice.bulkSale?.discountValue ||
    activeInvoice.packagedSale?.discountValue ||
    0
  );

  let discountAmt = 0;
  if (discountType === "percent" || discountType === "percentage") {
    discountAmt = (subtotal * discountValue) / 100;
  } else if (discountType === "flat") {
    discountAmt = discountValue;
  } else {
    discountAmt = Number(activeInvoice.discountAmount || 0);
  }

  const netTotal = Number(
    activeInvoice.totalAmount ||
    activeInvoice.netTotal ||
    activeInvoice.bulkSale?.totalAmount ||
    activeInvoice.packagedSale?.totalAmount ||
    Math.max(0, subtotal - discountAmt)
  );

  const rawPaid =
    activeInvoice.paidAmount ??
    activeInvoice.invoice?.paidAmount;

  const rawDue =
    activeInvoice.dueAmount ??
    activeInvoice.invoice?.dueAmount;

  let dueAmt = 0;
  let paidAmt = 0;

  if (rawDue !== undefined && rawDue !== null && rawDue !== "") {
    dueAmt = Number(rawDue);
    if (rawPaid !== undefined && rawPaid !== null && rawPaid !== "") {
      paidAmt = Number(rawPaid);
    } else {
      paidAmt = Math.max(0, netTotal - dueAmt);
    }
  } else if (rawPaid !== undefined && rawPaid !== null && rawPaid !== "") {
    paidAmt = Number(rawPaid);
    dueAmt = Math.max(0, netTotal - paidAmt);
  } else {
    const statusLower = String(statusVal).toLowerCase();
    if (statusLower.includes("unpaid") || statusLower.includes("pending")) {
      paidAmt = 0;
      dueAmt = netTotal;
    } else if (statusLower.includes("partially paid")) {
      paidAmt = 0; // Wait for correct API data instead of guessing
      dueAmt = 0;
    } else {
      paidAmt = netTotal;
      dueAmt = 0;
    }
  }

  const commissionObj =
    activeInvoice.commission ||
    activeInvoice.invoice?.commission ||
    orderData?.commission ||
    orderData?.invoice?.commission ||
    activeInvoice.bulkSale?.commission ||
    activeInvoice.packagedSale?.commission;

  const isCommissionAdjusted =
    Boolean(commissionObj) &&
    (commissionObj.isAdjusted === true ||
      String(commissionObj.isAdjusted).toLowerCase() === "true" ||
      commissionObj.isAdjusted === 1);

  const commissionAmt = isCommissionAdjusted
    ? Number(
        commissionObj?.commissionAmount ||
        activeInvoice.commissionAmount ||
        0
      )
    : 0;

  const commissionRate = isCommissionAdjusted
    ? (commissionObj?.commissionPercentage ||
       activeInvoice.commissionPercentage ||
       stakeholderObj?.commissionPercentage ||
       0)
    : 0;

  const displayPaidAmt = isCommissionAdjusted ? Math.max(0, paidAmt - commissionAmt) : paidAmt;

  // Payments History List
  const paymentsList = Array.isArray(activeInvoice.payments)
    ? activeInvoice.payments
    : Array.isArray(activeInvoice.invoice?.payments)
      ? activeInvoice.invoice.payments
      : [];

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const headStyles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((el) => el.outerHTML)
      .join("\n");

    const winPrint = window.open(
      "",
      "",
      "left=0,top=0,width=850,height=950,toolbar=0,scrollbars=1,status=0"
    );

    winPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Invoice - ${invoiceNo}</title>
          ${headStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 12mm 15mm 12mm;
            }
            * { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              box-sizing: border-box !important;
            }
            body { 
              background-color: #ffffff !important; 
              padding: 24px 32px !important; 
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
          </style>
        </head>
        <body>
          <div>${printContent.innerHTML}</div>
        </body>
      </html>
    `);

    winPrint.document.close();
    winPrint.focus();
    setTimeout(() => {
      winPrint.print();
      winPrint.close();
    }, 400);
  };

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header={`Invoice Details (${invoiceNo})`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Action Header */}
        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Invoice:</span>
            <span className="text-xs font-black font-mono text-emerald-800 bg-white px-2.5 py-1 rounded border border-slate-200">
              {invoiceNo}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition"
          >
            <FaPrint className="w-3.5 h-3.5" /> Print Invoice
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold">Loading invoice details from server...</p>
          </div>
        ) : (
          /* Printable Invoice Sheet Container */
          <div ref={printRef} className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 text-slate-800">
            {/* Header Branding & Invoice Meta */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <FaSeedling className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    CIRCLE SEED LTD.
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  High Quality Seed Production & Wholesale Distribution
                </p>
                <p className="text-[10px] text-slate-400">Dhaka, Bangladesh | Support: support@circleseed.com</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block">
                  Official Invoice
                </span>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {invoiceNo}
                </div>
                <div className="inline-block">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusVal.toLowerCase().includes("paid") && !statusVal.toLowerCase().includes("partially")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : statusVal.toLowerCase().includes("partially")
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                    {statusVal}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid: Invoice Meta & Stakeholder / Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <FaFileInvoiceDollar /> Invoice Details
                </h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                  <span>Order Ref:</span>
                  <span className="font-bold text-slate-800 font-mono">{orderNo}</span>

                  <span>Order Type:</span>
                  <span className="font-bold text-slate-800 uppercase">{orderType}</span>

                  <span>Date & Time:</span>
                  <span className="font-semibold text-slate-800">{dateStr}</span>

                  <span>Prepared By:</span>
                  <span className="font-semibold text-slate-800">{createdBy}</span>

                  {posLocationName && (
                    <>
                      <span>POS Outlet:</span>
                      <span className="font-bold text-emerald-800">{posLocationName}</span>
                    </>
                  )}

                  {isCommissionAdjusted && (
                    <>
                      <span>Commission:</span>
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px] inline-block w-fit">
                        Adjusted (৳{commissionAmt.toLocaleString()} - {commissionObj?.commissionPercentage || 0}%)
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1">
                  <FaUser /> Customer / Stakeholder
                </h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                  <span>Name:</span>
                  <span className="font-bold text-slate-900">{customerName}</span>

                  {companyName !== "-" && (
                    <>
                      <span>Company:</span>
                      <span className="font-semibold text-slate-800">{companyName}</span>
                    </>
                  )}

                  <span>Contact:</span>
                  <span className="font-mono text-slate-800">{contact}</span>

                  {address !== "-" && (
                    <>
                      <span>Address:</span>
                      <span className="font-semibold text-slate-800">{address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Order Items Summary
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-bold uppercase text-slate-600 text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Item / Seed Product</th>
                      <th className="py-2.5 px-3 text-center">Type</th>
                      <th className="py-2.5 px-3">Size / Batch</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-4 text-center text-slate-400 italic">
                          No order item details available.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => {
                        const isBulk =
                          !!item.bulkInventory ||
                          item.sourceType === "bulk" ||
                          (!!item.bulkInventoryId && !item.packagedInventory);

                        const seedName =
                          item.bulkInventory?.seedType?.value ||
                          item.packagedInventory?.seedType?.value ||
                          item.seedTypeName ||
                          item.name ||
                          "Seed Product";

                        const batchRef =
                          item.bulkInventory?.batchId ||
                          item.batchId ||
                          (item.packagedInventory?.bulkInventory?.batchId ? `Batch: ${item.packagedInventory.bulkInventory.batchId}` : null) ||
                          "-";

                        const sizeRef =
                          item.packagedInventory?.packetSize?.value
                            ? `${item.packagedInventory.packetSize.value}g`
                            : item.packetSize || (isBulk ? "Bulk (Kg)" : "-");

                        const unitLabel = isBulk ? "Kg" : (item.unitLabel || "Pcs");
                        const qtyDisplay = `${item.quantity} ${unitLabel}`;
                        const unitPriceDisplay = `৳${Number(item.unitPrice || 0).toLocaleString()}/${unitLabel}`;
                        const lineTotalDisplay = `৳${Number(item.totalPrice || (Number(item.quantity || 0) * Number(item.unitPrice || 0))).toLocaleString()}`;

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{seedName}</td>
                            <td className="py-2.5 px-3 text-center">
                              {isBulk ? (
                                <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                  Bulk
                                </span>
                              ) : (
                                <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                  Packaged
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">
                              {isBulk ? (
                                <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {batchRef}
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {sizeRef}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800">{qtyDisplay}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">{unitPriceDisplay}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-800">{lineTotalDisplay}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 font-mono">৳{subtotal.toLocaleString()}</span>
                </div>

                {discountAmt > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">- ৳{discountAmt.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                  <span>Net Total:</span>
                  <span className="font-black font-mono text-emerald-800">৳{netTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold text-xs pt-1 border-t border-slate-200">
                  <span>Paid Amount:</span>
                  <span className="font-bold font-mono">৳{displayPaidAmt.toLocaleString()}</span>
                </div>

                {isCommissionAdjusted && (
                  <div className="flex justify-between text-teal-700 font-semibold text-xs py-0.5">
                    <span>Commission Adjusted ({commissionObj?.commissionPercentage || 0}%):</span>
                    <span className="font-bold font-mono">৳{commissionAmt.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-rose-600 font-bold text-xs">
                  <span>Remaining Due:</span>
                  <span className="font-extrabold font-mono text-rose-700">৳{dueAmt.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-700 font-semibold text-xs pt-1 border-t border-slate-200">
                  <span>Status:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${statusVal.toLowerCase().includes("paid") && !statusVal.toLowerCase().includes("partially")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : statusVal.toLowerCase().includes("partially")
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                    {statusVal}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Transactions History Table */}
            {paymentsList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FaHistory className="text-emerald-600" /> Payment Transaction History ({paymentsList.length})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 font-bold uppercase text-slate-600 text-[10px]">
                      <tr>
                        <th className="py-2 px-3 w-8 text-center">#</th>
                        <th className="py-2 px-3">Date & Time</th>
                        <th className="py-2 px-3">Payment Method</th>
                        <th className="py-2 px-3 text-right">Amount Paid</th>
                        <th className="py-2 px-3">Received By</th>
                        <th className="py-2 px-3">Note / Remarks</th>
                        <th className="py-2 px-3">Vouchers / Receipts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {paymentsList.map((pay, pIdx) => {
                        const payDate = pay.createdAt ? formatDhakaDateTime(pay.createdAt) : "-";
                        const payMethod = pay.paymentMethod?.value || pay.paymentMethodName || "Cash";
                        const payAmt = Number(pay.amount || 0);
                        const receiver = pay.receivedBy?.fullName || pay.receivedBy?.employeeId || "Staff";
                        const payNote = pay.note || "-";

                        const rawImgs = pay.attachments || pay.imageUrls || pay.images || [];
                        const uniqueImgs = Array.from(
                          new Set(
                            (Array.isArray(rawImgs)
                              ? rawImgs.map((i) => (typeof i === "string" ? i : i?.imageUrl || i?.url)).filter(Boolean)
                              : [])
                          )
                        );

                        return (
                          <tr key={pay.id || pIdx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 text-center font-semibold text-slate-400">{pIdx + 1}</td>
                            <td className="py-1.5 px-3 text-slate-600 font-medium">{payDate}</td>
                            <td className="py-1.5 px-3 font-semibold text-emerald-800">{payMethod}</td>
                            <td className="py-1.5 px-3 text-right font-bold text-emerald-700 font-mono">৳{payAmt.toLocaleString()}</td>
                            <td className="py-1.5 px-3 font-medium text-slate-700">{receiver}</td>
                            <td className="py-1.5 px-3 text-slate-500 text-[11px]">{payNote}</td>
                            <td className="py-1.5 px-3">
                              {uniqueImgs.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {uniqueImgs.map((url, iIdx) => (
                                    <button
                                      key={iIdx}
                                      type="button"
                                      onClick={() => setPreviewReceiptUrl(url)}
                                      className="relative block w-8 h-8 rounded border border-slate-200 overflow-hidden hover:border-emerald-500 transition shadow-2xs group focus:outline-none"
                                      title="View Receipt Image"
                                    >
                                      <img src={url} alt={`receipt-${iIdx}`} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-center justify-center">
                                        <FaExpand className="w-2.5 h-2.5 text-white opacity-0 group-hover:opacity-100 transition" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px] italic">None</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Receipt Image Lightbox Modal */}
      {previewReceiptUrl && (
        <CustomModal
          open={!!previewReceiptUrl}
          setOpen={() => setPreviewReceiptUrl(null)}
          header="Payment Receipt Image Preview"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="relative bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[250px] max-h-[70vh]">
              <img
                src={previewReceiptUrl}
                alt="Payment Receipt Preview"
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
              >
                <FaExternalLinkAlt className="w-3.5 h-3.5" /> Open in New Tab
              </a>

              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </CustomModal>
  );
};

export default ViewInvoiceModal;
