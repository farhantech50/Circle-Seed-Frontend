import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaPrint, FaRedo, FaFileInvoiceDollar, FaBoxes, FaBoxOpen } from "react-icons/fa";
import useInventory from "../../../hooks/useInventory";
import useLookUp from "../../../hooks/useLookup";
import { useAuthStore } from "../../../store/authStore";
import SearchableSelect from "../../../components/SearchableSelect";
import showToast from "../../../utils/toast";

const QuotationCalculator = () => {
  const { authUser } = useAuthStore();
  const { getBulkReadyToSellList, getPackagedReadyToSellList, loading } = useInventory();
  const { getLookup } = useLookUp();

  // Lookups & Dropdowns
  const [seedTypes, setSeedTypes] = useState([]);
  const [selectedSeedTypeId, setSelectedSeedTypeId] = useState("");

  // Ready to Sell lists for selected seed type
  const [bulkList, setBulkList] = useState([]);
  const [packagedList, setPackagedList] = useState([]);
  const [fetchingList, setFetchingList] = useState(false);

  // Item Selector Form State
  const [sourceType, setSourceType] = useState("bulk"); // 'bulk' | 'packaged'
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // Customer / Quotation Header Info
  const [customerInfo, setCustomerInfo] = useState({
    quoteNo: `QT-${Date.now().toString().slice(-6)}`,
    quoteDate: new Date().toISOString().split("T")[0],
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });

  // Quotation Cart / Items List
  const [quoteItems, setQuoteItems] = useState([]);

  // Adjustments & Calculation State
  const [discountType, setDiscountType] = useState("fixed"); // 'fixed' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);
  const [transportCharge, setTransportCharge] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState("");

  // Fetch Seed Type Lookups
  useEffect(() => {
    const fetchSeedTypes = async () => {
      const res = await getLookup("seed_type");
      if (res.success) {
        setSeedTypes(res.data || []);
      }
    };
    fetchSeedTypes();
  }, []);

  // Fetch ready to sell bulk & packaged lists whenever selectedSeedTypeId changes
  useEffect(() => {
    if (selectedSeedTypeId) {
      fetchReadyToSellItems(selectedSeedTypeId);
    } else {
      setBulkList([]);
      setPackagedList([]);
    }
    setSelectedItemId("");
    setQuantity("");
    setUnitPrice("");
  }, [selectedSeedTypeId]);

  const fetchReadyToSellItems = async (seedTypeId) => {
    setFetchingList(true);
    const [resBulk, resPkg] = await Promise.all([
      getBulkReadyToSellList(seedTypeId),
      getPackagedReadyToSellList(seedTypeId),
    ]);

    if (resBulk.success) {
      setBulkList(resBulk.data || []);
    } else {
      setBulkList([]);
    }

    if (resPkg.success) {
      setPackagedList(resPkg.data || []);
    } else {
      setPackagedList([]);
    }
    setFetchingList(false);
  };

  // When selectedItemId or sourceType changes, prefill unit price and clear quantity if invalid
  useEffect(() => {
    if (!selectedItemId) {
      setUnitPrice("");
      return;
    }

    if (sourceType === "bulk") {
      const item = bulkList.find((i) => String(i.id) === String(selectedItemId));
      if (item) {
        setUnitPrice(item.unitPrice || "0");
      }
    } else {
      const item = packagedList.find((i) => String(i.id) === String(selectedItemId));
      if (item) {
        setUnitPrice(item.unitPrice || "0");
      }
    }
  }, [selectedItemId, sourceType, bulkList, packagedList]);

  const handleAddItem = (e) => {
    e.preventDefault();

    if (!selectedSeedTypeId) {
      showToast("Please select a Seed Type", "error");
      return;
    }

    if (!selectedItemId) {
      showToast(`Please select a ${sourceType === "bulk" ? "Bulk Batch" : "Packaged Item"}`, "error");
      return;
    }

    const qtyNum = Number(quantity);
    const priceNum = Number(unitPrice);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast("Please enter a valid quantity greater than 0", "error");
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      showToast("Please enter a valid unit price", "error");
      return;
    }

    const seedObj = seedTypes.find((s) => String(s.id) === String(selectedSeedTypeId));
    const seedTypeName = seedObj ? seedObj.value : "Unknown";

    let itemDetail = {};
    if (sourceType === "bulk") {
      const bulkItem = bulkList.find((i) => String(i.id) === String(selectedItemId));
      if (!bulkItem) return;

      const availQty = Number(bulkItem.remainingQuantity || 0);
      if (qtyNum > availQty) {
        showToast(`Entered quantity (${qtyNum} Kg) exceeds available stock (${availQty} Kg)`, "error");
        return;
      }

      itemDetail = {
        id: `bulk-${bulkItem.id}-${Date.now()}`,
        itemId: bulkItem.id,
        seedTypeId: selectedSeedTypeId,
        seedTypeName,
        sourceType: "bulk",
        refText: `Batch: ${bulkItem.batchId}`,
        unitLabel: "Kg",
        quantity: qtyNum,
        unitPrice: priceNum,
        totalPrice: qtyNum * priceNum,
        availableStock: availQty,
      };
    } else {
      const pkgItem = packagedList.find((i) => String(i.id) === String(selectedItemId));
      if (!pkgItem) return;

      const availQty = Number(pkgItem.remainingQuantity || 0);
      if (qtyNum > availQty) {
        showToast(`Entered quantity (${qtyNum} Pcs) exceeds available stock (${availQty} Pcs)`, "error");
        return;
      }

      const sizeVal = pkgItem.packetSize?.value ? `${pkgItem.packetSize.value}g` : "N/A";
      const batchRef = pkgItem.bulkInventory?.batchId ? ` (Batch: ${pkgItem.bulkInventory.batchId})` : "";

      itemDetail = {
        id: `pkg-${pkgItem.id}-${Date.now()}`,
        itemId: pkgItem.id,
        seedTypeId: selectedSeedTypeId,
        seedTypeName,
        sourceType: "packaged",
        refText: `Pkg Size: ${sizeVal}${batchRef}`,
        unitLabel: "Pcs",
        quantity: qtyNum,
        unitPrice: priceNum,
        totalPrice: qtyNum * priceNum,
        availableStock: availQty,
      };
    }

    setQuoteItems((prev) => [...prev, itemDetail]);
    setSelectedItemId("");
    setQuantity("");
    setUnitPrice("");
    showToast("Item added to quotation", "success");
  };

  const handleRemoveItem = (idToRemove) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const handleResetCalculator = () => {
    setQuoteItems([]);
    setSelectedSeedTypeId("");
    setSelectedItemId("");
    setQuantity("");
    setUnitPrice("");
    setDiscountValue(0);
    setTransportCharge(0);
    setTaxPercent(0);
    setNotes("");
    setCustomerInfo({
      quoteNo: `QT-${Date.now().toString().slice(-6)}`,
      quoteDate: new Date().toISOString().split("T")[0],
      customerName: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  // Financial Calculations
  const subtotal = quoteItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const calculatedDiscount =
    discountType === "percent"
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : Number(discountValue) || 0;

  const afterDiscount = Math.max(0, subtotal - calculatedDiscount);

  const calculatedTax = (afterDiscount * (Number(taxPercent) || 0)) / 100;

  const grandTotal = Math.round((afterDiscount + calculatedTax + (Number(transportCharge) || 0)) * 100) / 100;

  const handlePrint = () => {
    if (quoteItems.length === 0) {
      showToast("Please add at least one item before printing quotation", "error");
      return;
    }
    window.print();
  };

  // Options for item select dropdown based on current sourceType
  const currentItemOptions =
    sourceType === "bulk"
      ? bulkList.map((item) => ({
        id: item.id,
        label: `${item.batchId} | Stock: ${item.remainingQuantity} Kg | BDT ${item.unitPrice}/Kg`,
      }))
      : packagedList.map((item) => ({
        id: item.id,
        label: `${item.bulkInventory?.batchId ? `Batch: ${item.bulkInventory.batchId} - ` : ""}Size: ${item.packetSize?.value ? `${item.packetSize.value}g` : "N/A"
          } | Stock: ${item.remainingQuantity} Pcs | BDT ${item.unitPrice}/Pcs`,
      }));

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Printable Area Styling */}
      <style>{`
        @media screen {
          #printable-quotation {
            display: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-quotation, #printable-quotation * {
            visibility: visible !important;
          }
          #printable-quotation {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 rounded-xl text-primary-700">
            <FaFileInvoiceDollar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quotation Calculator</h2>
            <p className="text-xs text-gray-500">
              Generate instant, precise price quotations using ready-to-sell inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetCalculator}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-semibold transition"
          >
            <FaRedo className="w-4 h-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={
              quoteItems.length === 0 ||
              !(
                authUser?.permissions?.includes("SUPER") ||
                authUser?.permissions?.includes("PRINT_QUOTATION")
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-button-primary hover:bg-button-primary-hover text-white text-sm font-semibold shadow-md transition disabled:opacity-50"
          >
            <FaPrint className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Customer & Quote Header Inputs (Screen Form) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 no-print">
        <h3 className="text-base font-bold text-gray-800 border-b pb-2">
          Quotation Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Quote Reference #</label>
            <input
              type="text"
              value={customerInfo.quoteNo}
              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, quoteNo: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Quote Date</label>
            <input
              type="date"
              value={customerInfo.quoteDate}
              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, quoteDate: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Agro Ltd."
              value={customerInfo.customerName}
              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, customerName: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +8801700000000"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Item Selector Form (Screen Form) */}
      <form onSubmit={handleAddItem} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 no-print">
        <h3 className="text-base font-bold text-gray-800 border-b pb-2">
          Add Line Item to Quotation
        </h3>

        {/* Row 1: Top 3 fields in 1 line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Seed Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Seed Type</label>
            <SearchableSelect
              options={seedTypes}
              value={selectedSeedTypeId}
              onChange={setSelectedSeedTypeId}
              placeholder="Select Seed Type..."
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>

          {/* Source Type (Bulk or Packaged) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Inventory Type</label>
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setSourceType("bulk");
                  setSelectedItemId("");
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${sourceType === "bulk" ? "bg-white text-primary-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <FaBoxes className="w-3.5 h-3.5" />
                Bulk
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType("packaged");
                  setSelectedItemId("");
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${sourceType === "packaged" ? "bg-white text-primary-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <FaBoxOpen className="w-3.5 h-3.5" />
                Packaged
              </button>
            </div>
          </div>

          {/* Item / Batch Ready to Sell */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Select {sourceType === "bulk" ? "Bulk Batch" : "Packaged Package"} (Ready to Sell)
            </label>
            <SearchableSelect
              options={currentItemOptions}
              value={selectedItemId}
              onChange={setSelectedItemId}
              placeholder={
                !selectedSeedTypeId
                  ? "Select Seed Type first..."
                  : fetchingList
                    ? "Loading ready to sell items..."
                    : currentItemOptions.length === 0
                      ? `No ready-to-sell ${sourceType} items found`
                      : `Select ${sourceType === "bulk" ? "Batch" : "Package"}...`
              }
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.id}
            />
          </div>
        </div>

        {/* Row 2: Quantity, Unit Price (Read-only), and Add Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Quantity {sourceType === "bulk" ? "(Kg)" : "(Pcs)"}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="0.01"
              min="0.01"
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            />
          </div>

          {/* Unit Price (READ ONLY) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Unit Price (BDT / {sourceType === "bulk" ? "Kg" : "Pcs"})
            </label>
            <input
              type="number"
              value={unitPrice}
              readOnly
              tabIndex={-1}
              placeholder="Unit price"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-100 font-mono text-gray-700 cursor-not-allowed select-none"
            />
          </div>

          {/* Add Button */}
          <div>
            <button
              type="submit"
              disabled={
                !selectedItemId ||
                !quantity ||
                !(
                  authUser?.permissions?.includes("SUPER") ||
                  authUser?.permissions?.includes("CREATE_QUOTATION")
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-button-primary hover:bg-button-primary-hover text-white px-4 py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-50"
            >
              <FaPlus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </form>

      {/* Main Content & Calculations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Quotation Table (2 Columns wide) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 border-b pb-3 mb-4 flex justify-between items-center">
              <span>Quotation Items ({quoteItems.length})</span>
              <span className="text-xs font-normal text-gray-500">
                All prices in BDT
              </span>
            </h3>

            {quoteItems.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <FaFileInvoiceDollar className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No items added to quotation yet.</p>
                <p className="text-xs text-gray-400 mt-1">Select a seed type and add ready-to-sell items above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
                    <tr>
                      <th className="px-3 py-2.5">Item / Seed Type</th>
                      <th className="px-3 py-2.5">Ref Details</th>
                      <th className="px-3 py-2.5 text-right">Unit Price</th>
                      <th className="px-3 py-2.5 text-center">Qty</th>
                      <th className="px-3 py-2.5 text-right">Total</th>
                      <th className="px-3 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quoteItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-3 py-3 font-semibold text-gray-800">
                          {item.seedTypeName}
                          <span className="ml-2 inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-gray-100 text-gray-600">
                            {item.sourceType}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {item.refText}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-gray-700">
                          ৳{item.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-gray-800">
                          {item.quantity} <span className="text-xs font-normal text-gray-500">{item.unitLabel}</span>
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-primary-700 font-mono">
                          ৳{item.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Remove item"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary & Adjustments Box */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-800 border-b pb-2">
              Calculation Summary
            </h3>

            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm font-medium text-gray-600 pt-1">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-gray-800">৳{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <label className="font-semibold">Discount</label>
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border">
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${discountType === "fixed" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
                      }`}
                  >
                    BDT (৳)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${discountType === "percent" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
                      }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                placeholder={discountType === "fixed" ? "Discount amount in ৳" : "Discount percentage %"}
              />
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-medium pt-0.5">
                  <span>Discount Applied:</span>
                  <span>-৳{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Transport / Delivery Charge */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-600">Transport / Delivery Charge (৳)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={transportCharge}
                onChange={(e) => setTransportCharge(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                placeholder="Delivery charge"
              />
            </div>

            {/* VAT / Tax */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-600">VAT / Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                placeholder="VAT %"
              />
              {calculatedTax > 0 && (
                <div className="flex justify-between text-xs text-gray-600 font-medium pt-0.5">
                  <span>VAT ({taxPercent}%):</span>
                  <span>+৳{calculatedTax.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1 pt-2">
              <label className="block text-xs font-semibold text-gray-600">Quotation Notes / Terms</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, delivery details..."
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-primary-50 border border-primary-200 p-4 rounded-xl space-y-1 mt-4">
            <span className="text-xs uppercase tracking-wider font-bold text-primary-800">
              Grand Total Amount
            </span>
            <div className="text-2xl font-black text-primary-900 font-mono">
              ৳{grandTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE QUOTATION TEMPLATE (Renders in window.print()) */}
      <div id="printable-quotation" className="space-y-6">
        {/* Printable Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CIRCLE SEED</h1>
            <p className="text-xs text-gray-600">Premium Seed & Agricultural Solutions</p>
            <p className="text-xs text-gray-600 mt-1">Official Price Quotation</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-primary-800">PRICE QUOTATION</h2>
            <p className="text-xs text-gray-600">Quote Ref: <span className="font-semibold">{customerInfo.quoteNo}</span></p>
            <p className="text-xs text-gray-600">Date: <span className="font-semibold">{customerInfo.quoteDate}</span></p>
          </div>
        </div>

        {/* Customer Information */}
        {(customerInfo.customerName || customerInfo.phone || customerInfo.address) && (
          <div className="bg-gray-50 p-3 rounded border text-xs space-y-1">
            <p className="font-bold text-gray-700 uppercase">Quotation Prepared For:</p>
            {customerInfo.customerName && <p className="font-semibold text-gray-900">{customerInfo.customerName}</p>}
            {customerInfo.phone && <p>Phone: {customerInfo.phone}</p>}
            {customerInfo.address && <p>Address: {customerInfo.address}</p>}
          </div>
        )}

        {/* Items Table */}
        <table className="w-full text-left text-xs border-collapse border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Item / Seed Type</th>
              <th className="p-2 border">Details</th>
              <th className="p-2 border text-right">Unit Price</th>
              <th className="p-2 border text-center">Qty</th>
              <th className="p-2 border text-right">Total Price (BDT)</th>
            </tr>
          </thead>
          <tbody>
            {quoteItems.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border font-semibold">{item.seedTypeName} ({item.sourceType})</td>
                <td className="p-2 border">{item.refText}</td>
                <td className="p-2 border text-right">৳{item.unitPrice.toLocaleString()}</td>
                <td className="p-2 border text-center">{item.quantity} {item.unitLabel}</td>
                <td className="p-2 border text-right font-semibold">৳{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Breakdown */}
        <div className="flex justify-end pt-2">
          <div className="w-64 text-xs space-y-1.5 border p-3 rounded bg-gray-50">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
            </div>
            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-৳{calculatedDiscount.toLocaleString()}</span>
              </div>
            )}
            {Number(transportCharge) > 0 && (
              <div className="flex justify-between">
                <span>Transport / Delivery:</span>
                <span>+৳{Number(transportCharge).toLocaleString()}</span>
              </div>
            )}
            {calculatedTax > 0 && (
              <div className="flex justify-between">
                <span>VAT ({taxPercent}%):</span>
                <span>+৳{calculatedTax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t pt-1 text-gray-900">
              <span>Grand Total:</span>
              <span>৳{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {notes && (
          <div className="border p-3 rounded text-xs space-y-1">
            <p className="font-bold text-gray-700">Terms & Notes:</p>
            <p className="text-gray-600 whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {/* Signature Footer */}
        <div className="flex justify-between items-end pt-12 text-xs text-gray-500">
          <div className="border-t border-gray-400 pt-1 w-36 text-center">
            Authorized Signature
          </div>
          <div className="border-t border-gray-400 pt-1 w-36 text-center">
            Customer Acceptance
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationCalculator;
