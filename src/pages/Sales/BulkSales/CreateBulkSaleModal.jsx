import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaPlus, FaSeedling, FaTag, FaFileInvoiceDollar, FaUser } from "react-icons/fa";
import CustomModal from "../../../components/CustomModal";
import SearchableSelect from "../../../components/SearchableSelect";
import useBulkSales from "../../../hooks/useBulkSales";
import showToast from "../../../utils/toast";

const CreateBulkSaleModal = ({ open, setOpen, onSuccess }) => {
  const { createBulkOrder, getBulkReadyToSellList, getStakeholders, submittingOrder } = useBulkSales();

  const [stakeholderId, setStakeholderId] = useState("");
  const [discountType, setDiscountType] = useState("flat"); // "flat" | "percent" | "none"
  const [discountValue, setDiscountValue] = useState(0);
  const [note, setNote] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState("paid");

  const [stakeholders, setStakeholders] = useState([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(false);

  const [bulkInventoryList, setBulkInventoryList] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Line items state
  const [items, setItems] = useState([
    {
      id: Date.now(),
      bulkInventoryId: "",
      quantity: 1,
      unitPrice: 0,
      availableQty: 0,
      seedTypeName: "",
      batchId: "",
    },
  ]);

  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      resetForm();
    }
  }, [open]);

  const loadInitialData = async () => {
    setLoadingStakeholders(true);
    setLoadingInventory(true);

    const [stkRes, invRes] = await Promise.all([
      getStakeholders(),
      getBulkReadyToSellList(),
    ]);

    if (stkRes.success) {
      setStakeholders(stkRes.data || []);
    }
    setLoadingStakeholders(false);

    if (invRes.success) {
      setBulkInventoryList(invRes.data || []);
    }
    setLoadingInventory(false);
  };

  const resetForm = () => {
    setStakeholderId("");
    setDiscountType("flat");
    setDiscountValue(0);
    setNote("");
    setInvoiceStatus("paid");
    setItems([
      {
        id: Date.now(),
        bulkInventoryId: "",
        quantity: 1,
        unitPrice: 0,
        availableQty: 0,
        seedTypeName: "",
        batchId: "",
      },
    ]);
  };

  // Convert stakeholders to SearchableSelect options
  const stakeholderOptions = useMemo(() => {
    return stakeholders.map((stk) => {
      const name = stk.name || stk.companyName || `Stakeholder #${stk.id}`;
      const code = stk.stakeholderId || stk.phone || stk.email || "";
      const type = stk.stakeholderType?.value || stk.type || "";
      return {
        label: `${name} ${code ? `(${code})` : ""} ${type ? `[${type}]` : ""}`,
        value: stk.id,
      };
    });
  }, [stakeholders]);

  // Convert bulk inventory list to SearchableSelect options
  const inventoryOptions = useMemo(() => {
    return bulkInventoryList.map((item) => {
      const seedName = item.seedType?.name || item.seedTypeName || "Seed";
      const variety = item.varietyName ? ` - ${item.varietyName}` : "";
      const batch = item.batchId ? ` (Batch: ${item.batchId})` : ` (ID: ${item.id})`;
      const remaining = item.remainingQuantity !== undefined ? item.remainingQuantity : item.quantity || 0;
      const price = item.unitPrice || 0;
      return {
        label: `${seedName}${variety}${batch} — Stock: ${remaining} Kg — BDT ${price}/Kg`,
        value: item.id,
        raw: item,
      };
    });
  }, [bulkInventoryList]);

  // Handle selecting an inventory item in a line
  const handleItemSelect = (lineId, inventoryId) => {
    const selectedInv = bulkInventoryList.find((i) => String(i.id) === String(inventoryId));

    setItems((prev) =>
      prev.map((line) => {
        if (line.id === lineId) {
          if (!selectedInv) {
            return {
              ...line,
              bulkInventoryId: "",
              quantity: 1,
              unitPrice: 0,
              availableQty: 0,
              seedTypeName: "",
              batchId: "",
            };
          }

          const remQty = selectedInv.remainingQuantity !== undefined ? selectedInv.remainingQuantity : selectedInv.quantity || 0;
          const uPrice = Number(selectedInv.unitPrice || 0);

          return {
            ...line,
            bulkInventoryId: selectedInv.id,
            quantity: 1,
            unitPrice: uPrice,
            availableQty: remQty,
            seedTypeName: selectedInv.seedType?.name || selectedInv.seedTypeName || "Seed",
            batchId: selectedInv.batchId || "",
          };
        }
        return line;
      })
    );
  };

  const handleFieldChange = (lineId, field, val) => {
    setItems((prev) =>
      prev.map((line) => {
        if (line.id === lineId) {
          return { ...line, [field]: val };
        }
        return line;
      })
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        bulkInventoryId: "",
        quantity: 1,
        unitPrice: 0,
        availableQty: 0,
        seedTypeName: "",
        batchId: "",
      },
    ]);
  };

  const handleRemoveItem = (lineId) => {
    if (items.length === 1) {
      showToast("At least one item is required for a bulk sale order.", "warning");
      return;
    }
    setItems((prev) => prev.filter((line) => line.id !== lineId));
  };

  // Subtotal & Total calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + q * p;
    }, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (discountType === "percent") {
      return (subtotal * val) / 100;
    } else if (discountType === "flat") {
      return val;
    }
    return 0;
  }, [subtotal, discountType, discountValue]);

  const netTotal = Math.max(0, subtotal - discountAmount);

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!stakeholderId) {
      showToast("Please select a Customer / Stakeholder", "error");
      return;
    }

    if (!items.length) {
      showToast("Please add at least one bulk item", "error");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const line = items[i];
      if (!line.bulkInventoryId) {
        showToast(`Please select a bulk inventory batch for row #${i + 1}`, "error");
        return;
      }
      if (Number(line.quantity) <= 0) {
        showToast(`Quantity for row #${i + 1} must be greater than 0`, "error");
        return;
      }
      if (line.availableQty > 0 && Number(line.quantity) > line.availableQty) {
        showToast(`Quantity for row #${i + 1} exceeds available stock (${line.availableQty} Kg)`, "error");
        return;
      }
    }

    Swal.fire({
      title: "Confirm Bulk Sale Order?",
      html: `
        <div class="text-left text-sm space-y-2">
          <p><strong>Subtotal:</strong> BDT ${subtotal.toLocaleString()}</p>
          <p><strong>Discount:</strong> BDT ${discountAmount.toLocaleString()}</p>
          <p class="text-emerald-700 font-bold text-base"><strong>Net Total:</strong> BDT ${netTotal.toLocaleString()}</p>
          <p><strong>Invoice Status:</strong> ${invoiceStatus}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Create Order",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const payload = {
        stakeholderId: Number(stakeholderId),
        discountType: discountType === "none" ? "none" : discountType,
        discountValue: Number(discountValue) || 0,
        note: note.trim(),
        invoiceStatus: invoiceStatus,
        items: items.map((line) => ({
          bulkInventoryId: Number(line.bulkInventoryId),
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
        })),
      };

      const res = await createBulkOrder(payload);

      if (res.success) {
        Swal.fire({
          title: "Order Created!",
          text: res.message || "Bulk sale order processed successfully.",
          icon: "success",
          confirmButtonColor: "#059669",
        });
        setOpen(false);
        if (typeof onSuccess === "function") {
          onSuccess(res.data);
        }
      } else {
        Swal.fire({
          title: "Order Creation Failed",
          text: res.message || "Could not process bulk sale order.",
          icon: "error",
          confirmButtonColor: "#059669",
        });
      }
    });
  };

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Create New Bulk Sale Order"
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stakeholder Selection & Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
              <FaUser className="text-emerald-600" /> Customer / Stakeholder <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={stakeholderOptions}
              value={stakeholderId}
              onChange={(val) => setStakeholderId(val)}
              placeholder={loadingStakeholders ? "Loading customers..." : "Select Customer / Stakeholder"}
              searchPlaceholder="Search by name, code or phone..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
              <FaFileInvoiceDollar className="text-emerald-600" /> Invoice Status <span className="text-red-500">*</span>
            </label>
            <select
              value={invoiceStatus}
              onChange={(e) => setInvoiceStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Bulk Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FaSeedling className="text-emerald-600" /> Bulk Sale Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
            >
              <FaPlus className="w-3 h-3" /> Add Row
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Bulk Batch / Seed Item</th>
                    <th className="py-2.5 px-3 w-28 text-right">Available (Kg)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Quantity (Kg)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Unit Price (BDT)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Line Total (BDT)</th>
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.map((line, idx) => {
                    const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);

                    return (
                      <tr key={line.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 text-center font-medium text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <SearchableSelect
                            options={inventoryOptions}
                            value={line.bulkInventoryId}
                            onChange={(val) => handleItemSelect(line.id, val)}
                            placeholder={loadingInventory ? "Loading inventory..." : "Select Bulk Inventory Item"}
                            searchPlaceholder="Search seed or batch..."
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                          {line.bulkInventoryId ? `${line.availableQty} Kg` : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={line.quantity}
                            onChange={(e) => handleFieldChange(line.id, "quantity", e.target.value)}
                            className="w-full text-right rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                            placeholder="Qty"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            value={line.unitPrice}
                            disabled
                            readOnly
                            className="w-full text-right rounded-md border border-slate-200 bg-slate-100 text-slate-500 font-mono px-2 py-1.5 text-xs focus:outline-none cursor-not-allowed"
                            placeholder="Price"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          BDT {lineTotal.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(line.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition rounded-md hover:bg-red-50"
                            title="Remove row"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Discounts, Notes, and Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                <FaTag className="text-emerald-600" /> Discount Type & Value
              </label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="flat">Flat (BDT)</option>
                  <option value="percent">Percent (%)</option>
                  <option value="none">None</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="any"
                  disabled={discountType === "none"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
                  placeholder="Discount value"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider">
                Note / Remarks (Optional)
              </label>
              <textarea
                rows="2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs focus:border-emerald-500 focus:outline-none"
                placeholder="Enter any additional instructions or sale notes..."
              />
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-semibold text-slate-800">BDT {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Discount ({discountType === "percent" ? `${discountValue}%` : discountType === "flat" ? "Flat BDT" : "None"}):</span>
                <span className="font-semibold text-amber-600">- BDT {discountAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-1 text-sm font-extrabold text-emerald-800">
                <span>Net Amount:</span>
                <span className="text-base text-emerald-700">BDT {netTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingOrder}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-2"
              >
                {submittingOrder ? "Processing..." : "Complete Bulk Sale Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateBulkSaleModal;
