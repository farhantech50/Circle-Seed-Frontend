import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaHistory,
  FaUser,
  FaCheckCircle,
  FaRedo,
  FaFileInvoiceDollar,
  FaTag,
  FaEye,
  FaListAlt,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import usePackagedSales from "../../../hooks/usePackagedSales";
import useLookUp from "../../../hooks/useLookup";
import SearchableSelect from "../../../components/SearchableSelect";
import DataTable from "../../../components/DataTable";
import DataTableWithoutApiPagination from "../../../components/DataTableWithoutApiPagination";
import CustomModal from "../../../components/CustomModal";
import showToast from "../../../utils/toast";
import Swal from "sweetalert2";
import ViewPackagedSaleModal from "./ViewPackagedSaleModal";
import { usePaginationStore } from "../../../store/paginationStore";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { formatDhakaDate } from "../../../utils/dateUtils";

const PackagedSales = () => {
  const navigate = useNavigate();
  const { getLookup } = useLookUp();
  const {
    createPackagedOrder,
    getPackagedOrders,
    getPackagedReadyToSellList,
    getStakeholders,
    loading,
    submittingOrder,
  } = usePackagedSales();

  const { page, limit, setTotalData } = usePaginationStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();

  // Lookups & Options
  const [seedTypes, setSeedTypes] = useState([]);
  const [selectedSeedTypeId, setSelectedSeedTypeId] = useState("");

  const [stakeholders, setStakeholders] = useState([]);
  const [loadingStakeholders, setLoadingStakeholders] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const [packagedProductsList, setPackagedProductsList] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  // Line Item Selector Form State
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  // Packaged Sale Cart State
  const [cart, setCart] = useState([]);

  // Stakeholder, Discount & Payment Form State
  const [stakeholderId, setStakeholderId] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState(0);
  const [note, setNote] = useState("");

  // Modals State
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [recentSalesOpen, setRecentSalesOpen] = useState(false);
  const [recentSales, setRecentSales] = useState([]);

  const [allHistoryOpen, setAllHistoryOpen] = useState(false);
  const [historyOrders, setHistoryOrders] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingStakeholders(true);
    const [resSeed, resStk, resPay] = await Promise.all([
      getLookup("seed_type"),
      getStakeholders(),
      getLookup("payment_method"),
    ]);

    if (resSeed.success) {
      setSeedTypes(resSeed.data || []);
    }
    if (resStk.success) {
      setStakeholders(resStk.data || []);
    }
    if (resPay.success && Array.isArray(resPay.data)) {
      setPaymentMethods(resPay.data);
      if (resPay.data.length > 0) {
        setPaymentMethodId(resPay.data[0].id);
      }
    }
    setLoadingStakeholders(false);

    fetchRecentSalesList();
  };

  const fetchRecentSalesList = async () => {
    const res = await getPackagedOrders({ limit: 10, page: 1 });
    if (res.success && Array.isArray(res.data)) {
      setRecentSales(res.data);
    }
  };

  // Fetch ready-to-sell packaged inventory items whenever selectedSeedTypeId changes
  useEffect(() => {
    if (selectedSeedTypeId) {
      fetchPackagedProducts(selectedSeedTypeId);
    } else {
      setPackagedProductsList([]);
    }
    setSelectedPackageId("");
    setQuantity("1");
    setUnitPrice("");
  }, [selectedSeedTypeId]);

  const fetchPackagedProducts = async (seedTypeId) => {
    setFetchingProducts(true);
    const res = await getPackagedReadyToSellList(seedTypeId);
    if (res.success) {
      setPackagedProductsList(res.data || []);
    } else {
      setPackagedProductsList([]);
    }
    setFetchingProducts(false);
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
        name: name,
      };
    });
  }, [stakeholders]);

  // Options for packaged products dropdown
  const productDropdownOptions = useMemo(() => {
    return packagedProductsList.map((pkg) => {
      const seedName = pkg.seedTypeName || pkg.seedType?.value || pkg.bulkInventory?.seedType?.value || "Seed";
      const sizeName = pkg.packetSize?.value
        ? `${pkg.packetSize.value} gm`
        : pkg.packetSizeId
        ? `${pkg.packetSizeId} gm`
        : "Pack";
      const availableQty = pkg.remainingQuantity !== undefined ? pkg.remainingQuantity : pkg.quantity || 0;
      const price = pkg.unitPrice || 0;

      return {
        id: pkg.id,
        label: `${seedName} - ${sizeName} | Stock: ${availableQty} Pcs | Price: ৳${price}`,
        seedTypeName: seedName,
        packetSize: sizeName,
        price: price,
        availableQty: Number(availableQty),
        pkgData: pkg,
      };
    });
  }, [packagedProductsList]);

  // Handle selected packaged item change
  const handlePackageSelect = (packageId) => {
    setSelectedPackageId(packageId);
    const selectedObj = productDropdownOptions.find((p) => String(p.id) === String(packageId));
    if (selectedObj) {
      setUnitPrice(selectedObj.price);
    } else {
      setUnitPrice("");
    }
  };

  // Add Item to Sale Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedPackageId) {
      showToast("Please select a packaged product item", "error");
      return;
    }

    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      showToast("Please enter a valid quantity", "error");
      return;
    }

    const itemObj = productDropdownOptions.find((p) => String(p.id) === String(selectedPackageId));
    if (!itemObj) return;

    if (numQty > itemObj.availableQty) {
      showToast(`Only ${itemObj.availableQty} Pcs available in stock!`, "warning");
      return;
    }

    const existingIdx = cart.findIndex((i) => String(i.packagedInventoryId) === String(selectedPackageId));

    if (existingIdx >= 0) {
      const updatedCart = [...cart];
      const newTotalQty = updatedCart[existingIdx].quantity + numQty;

      if (newTotalQty > itemObj.availableQty) {
        showToast(`Cannot add more than available stock (${itemObj.availableQty} Pcs)`, "warning");
        return;
      }

      updatedCart[existingIdx].quantity = newTotalQty;
      setCart(updatedCart);
      showToast(`Updated quantity for ${itemObj.seedTypeName} (${itemObj.packetSize})`, "success");
    } else {
      const newCartItem = {
        id: selectedPackageId,
        packagedInventoryId: selectedPackageId,
        seedTypeName: itemObj.seedTypeName,
        packetSize: itemObj.packetSize,
        unitPrice: Number(itemObj.price),
        quantity: numQty,
        maxStock: itemObj.availableQty,
      };
      setCart([...cart, newCartItem]);
      showToast(`Added ${itemObj.seedTypeName} to cart`, "success");
    }

    // Reset selector inputs
    setSelectedPackageId("");
    setQuantity("1");
    setUnitPrice("");
  };

  // Update Cart Item Quantity
  const handleUpdateCartQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              showToast(`Stock limit reached (${item.maxStock} Pcs max)`, "warning");
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Subtotal, Discount & Net Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
  }, [cart]);

  const totalQtyPcs = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (discountType === "percent") {
      return (subtotal * val) / 100;
    }
    if (discountType === "flat") {
      return val;
    }
    return 0;
  }, [subtotal, discountType, discountValue]);

  const netTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const dueAmount = useMemo(() => {
    const paid = paidAmount !== "" ? Number(paidAmount) : netTotal;
    return Math.max(0, netTotal - paid);
  }, [netTotal, paidAmount]);

  // Complete Order Handler
  const handleCompleteOrder = async () => {
    if (!cart.length) {
      showToast("Your packaged sale cart is empty!", "error");
      return;
    }

    if (!stakeholderId) {
      showToast("Please select a stakeholder!", "error");
      return;
    }

    if (!paymentMethodId) {
      showToast("Please select a payment method!", "error");
      return;
    }

    const selectedStk = stakeholders.find((s) => String(s.id) === String(stakeholderId));
    const customerNameDisplay = selectedStk ? selectedStk.name || selectedStk.companyName : "Selected Stakeholder";

    const selectedPay = paymentMethods.find((p) => String(p.id) === String(paymentMethodId));
    const paymentMethodNameDisplay = selectedPay ? selectedPay.value || selectedPay.name : "Cash";

    const paidVal = paidAmount !== "" ? Number(paidAmount) : netTotal;
    const calcDue = Math.max(0, netTotal - paidVal);

    const payload = {
      stakeholderId: Number(stakeholderId),
      discountType: discountType === "none" ? "flat" : discountType,
      discountValue: discountType === "none" ? "0" : String(discountValue || 0),
      note: note.trim(),
      paidAmount: Number(paidVal),
      paymentMethodId: Number(paymentMethodId),
      items: cart.map((item) => ({
        packagedInventoryId: Number(item.packagedInventoryId),
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
    };

    const confirmResult = await Swal.fire({
      title: "Confirm Packaged Sale Order?",
      html: `
        <div class="text-left text-xs space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <p><strong>Stakeholder:</strong> ${customerNameDisplay}</p>
          <p><strong>Payment Method:</strong> ${paymentMethodNameDisplay}</p>
          <p><strong>Items Count:</strong> ${cart.length} Products (${totalQtyPcs} Pcs)</p>
          <p><strong>Subtotal:</strong> ৳${subtotal.toLocaleString()}</p>
          <p><strong>Discount:</strong> ৳${discountAmount.toLocaleString()}</p>
          <p class="text-emerald-700 font-bold text-sm"><strong>Net Total:</strong> ৳${netTotal.toLocaleString()}</p>
          <p><strong>Paid Amount:</strong> ৳${paidVal.toLocaleString()}</p>
          ${
            calcDue > 0
              ? `<p class="text-rose-600 font-bold"><strong>Due Amount:</strong> ৳${calcDue.toLocaleString()}</p>`
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Submit Packaged Sale",
    });

    if (!confirmResult.isConfirmed) return;

    const res = await createPackagedOrder(payload);

    if (res.success) {
      Swal.fire({
        title: "Order Completed!",
        text: res.message || "Packaged sale order created successfully.",
        icon: "success",
        confirmButtonColor: "#059669",
      });

      const orderResp = res.data || {};
      const createdOrderData = {
        ...orderResp,
        saleId: orderResp.saleId || `PSL-${String(orderResp.id || "1").padStart(4, "0")}`,
        orderNo: orderResp.saleId || `PSL-${String(orderResp.id || "1").padStart(4, "0")}`,
        stakeholder: selectedStk,
        stakeholderName: customerNameDisplay,
        paymentMethod: selectedPay,
        paymentMethodName: paymentMethodNameDisplay,
        items: cart.map((i) => ({
          ...i,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: Number(i.quantity) * Number(i.unitPrice),
          packagedInventory: {
            seedType: { value: i.seedTypeName },
            packetSize: { value: i.packetSize },
          },
        })),
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        totalAmount: netTotal,
        paidAmount: paidVal,
        dueAmount: calcDue,
        note,
        createdAt: orderResp.createdAt || new Date().toISOString(),
      };

      setActiveReceiptOrder(createdOrderData);
      setReceiptOpen(true);

      resetRegisterForm();
      fetchRecentSalesList();
      setTriggerRefresh();
    } else {
      Swal.fire({
        title: "Order Failed",
        text: res.message || "Failed to create packaged sale order.",
        icon: "error",
        confirmButtonColor: "#059669",
      });
    }
  };

  const resetRegisterForm = () => {
    setCart([]);
    setStakeholderId("");
    setDiscountType("flat");
    setDiscountValue(0);
    setNote("");
    setPaidAmount("");
    setSelectedSeedTypeId("");
    setSelectedPackageId("");
    setQuantity("1");
    setUnitPrice("");
  };

  // Open All Orders History Modal
  const handleOpenAllHistoryModal = async () => {
    setAllHistoryOpen(true);
    const res = await getPackagedOrders({ page, limit });
    if (res.success && Array.isArray(res.data)) {
      setHistoryOrders(res.data);
      setTotalData(res.total || res.data.length);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FaBoxOpen className="w-6 h-6" />
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Packaged Sales Register (Wholesale)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create wholesale packaged seed sales for distributors, dealers, and stakeholders.
          </p>
        </div>

        {/* Quick Modal Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setRecentSalesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs"
          >
            <FaHistory className="w-3.5 h-3.5" /> Recent Sales ({recentSales.length})
          </button>

          <button
            type="button"
            onClick={handleOpenAllHistoryModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition shadow-xs"
          >
            <FaListAlt className="w-3.5 h-3.5 text-emerald-600" /> All Packaged History
          </button>

          <button
            type="button"
            onClick={() => navigate("/sales/packaged-history")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition shadow-xs"
          >
            Go to Orders Page
          </button>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Selector Form & Cart Items Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Item Selector Form Card */}
          <form onSubmit={handleAddToCart} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Select Seed & Packaged Product Item
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Step 1: Add Items to Cart
              </span>
            </h3>

            {/* Row 1: Seed Type & Packaged Product Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  1. Select Seed Type <span className="text-emerald-600">*</span>
                </label>
                <SearchableSelect
                  options={seedTypes}
                  value={selectedSeedTypeId}
                  onChange={setSelectedSeedTypeId}
                  placeholder="Select Seed Type..."
                  getOptionLabel={(opt) => opt.value}
                  getOptionValue={(opt) => opt.id}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  2. Select Packaged Product (Ready to Sell) <span className="text-emerald-600">*</span>
                </label>
                <SearchableSelect
                  options={productDropdownOptions}
                  value={selectedPackageId}
                  onChange={handlePackageSelect}
                  placeholder={
                    !selectedSeedTypeId
                      ? "Select Seed Type first..."
                      : fetchingProducts
                      ? "Loading packaged inventory..."
                      : productDropdownOptions.length === 0
                      ? "No ready-to-sell packaged stock found"
                      : "Select Packaged Item..."
                  }
                  getOptionLabel={(opt) => opt.label}
                  getOptionValue={(opt) => opt.id}
                />
              </div>
            </div>

            {/* Row 2: Quantity (Pcs), Unit Price & Add Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-0.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Quantity (Pcs) <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Unit Price (BDT/Pcs) <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  disabled
                  readOnly
                  placeholder="Unit Price"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-slate-100 font-mono text-slate-500 font-bold focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!selectedPackageId}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </div>
          </form>

          {/* Cart Table Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FaShoppingCart className="text-emerald-600" /> Packaged Sale Cart Items
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {cart.length} Products ({totalQtyPcs} Pcs)
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                <FaShoppingCart className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-medium">Cart is currently empty.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Select seed type & packaged item above to add products.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 uppercase font-semibold text-slate-600 border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-2 px-2.5 w-8 text-center">#</th>
                      <th className="py-2 px-2.5">Item & Variety</th>
                      <th className="py-2 px-2.5">Packet Size</th>
                      <th className="py-2 px-2.5 text-center w-32">Quantity (Pcs)</th>
                      <th className="py-2 px-2.5 text-right w-24">Price (BDT)</th>
                      <th className="py-2 px-2.5 text-right w-28">Total (BDT)</th>
                      <th className="py-2 px-2.5 text-center w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {cart.map((item, idx) => {
                      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-2.5 text-center font-medium text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2.5 font-semibold text-slate-800">
                            {item.seedTypeName}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 font-medium">
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {item.packetSize}
                            </span>
                          </td>
                          <td className="py-2 px-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(item.id, -1)}
                                className="p-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                              >
                                <FaMinus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQty(item.id, 1)}
                                className="p-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                              >
                                <FaPlus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-medium text-slate-700">
                            ৳{item.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5 text-right font-bold text-slate-800">
                            ৳{lineTotal.toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition rounded hover:bg-red-50"
                              title="Remove item"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stakeholder Details, Discount & Payment Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Stakeholder & Payment Details
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Step 2: Checkout
              </span>
            </h3>

            {/* Row: Stakeholder & Payment Method Side-by-Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Stakeholder Select */}
              <div className="space-y-0.5">
                <label className="block text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <FaUser className="text-emerald-600 text-xs" /> Stakeholder <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={stakeholderOptions}
                  value={stakeholderId}
                  onChange={(val) => setStakeholderId(val)}
                  placeholder={loadingStakeholders ? "Loading..." : "Select Stakeholder..."}
                  searchPlaceholder="Search stakeholder..."
                />
              </div>

              {/* Payment Method Select */}
              <div className="space-y-0.5">
                <label className="block text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <FaCreditCard className="text-emerald-600 text-xs" /> Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.value || pm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discount Section */}
            <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <FaTag className="text-emerald-600 text-xs" /> Discount Type & Value
              </label>
              <div className="flex gap-2">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
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
                  placeholder="Discount value"
                  className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Row: Paid Amount & Remarks / Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paid Amount */}
              <div className="space-y-0.5">
                <label className="block text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <FaMoneyBillWave className="text-emerald-600 text-xs" /> Paid Amount (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={netTotal ? `${netTotal}` : "Paid Amount"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-emerald-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Note / Remarks */}
              <div className="space-y-0.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter order remarks..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Price Calculations Card */}
            <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1.5 shadow-sm">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Quantity:</span>
                <span className="font-bold text-white">{totalQtyPcs} Pcs</span>
              </div>

              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal ({cart.length} Items):</span>
                <span className="font-bold text-white">৳{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-amber-400">
                  <span>Discount ({discountType === "percent" ? `${discountValue}%` : "Flat BDT"}):</span>
                  <span className="font-bold">- ৳{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-slate-700 pt-1.5 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Net Amount:</span>
                <span className="text-lg font-black text-emerald-400 tracking-tight">
                  ৳{netTotal.toLocaleString()}
                </span>
              </div>

              {paidAmount !== "" && (
                <>
                  <div className="flex justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
                    <span>Paid Amount:</span>
                    <span className="font-bold text-white">৳{Number(paidAmount).toLocaleString()}</span>
                  </div>
                  {dueAmount > 0 ? (
                    <div className="flex justify-between text-xs text-rose-400 font-bold">
                      <span>Due Amount:</span>
                      <span>৳{dueAmount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs text-emerald-400 font-bold">
                      <span>Change / Full Payment:</span>
                      <span>৳{Math.abs(netTotal - Number(paidAmount)).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              type="button"
              onClick={handleCompleteOrder}
              disabled={submittingOrder || !cart.length || !stakeholderId}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheckCircle className="w-4 h-4" />
              {submittingOrder ? "Processing Packaged Order..." : "Complete Packaged Sale"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sales Modal */}
      <CustomModal
        open={recentSalesOpen}
        setOpen={setRecentSalesOpen}
        header="Recent Wholesale Packaged Sales History"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <DataTableWithoutApiPagination
            headerConfig={{ title: "Recent Packaged Sales Orders" }}
            tableHead={["SL", "Order ID", "Stakeholder", "Net Amount", "Status", "Date", "Action"]}
            tableData={recentSales.map((item) => {
              const statusValue =
                typeof item.invoice?.status === "object" && item.invoice?.status?.value
                  ? item.invoice.status.value
                  : typeof item.status === "object" && item.status?.value
                  ? item.status.value
                  : typeof item.status === "string"
                  ? item.status
                  : item.invoiceStatus || "Paid";

              return {
                ...item,
                status: statusValue,
                statusName: statusValue,
                orderNo: item.saleId || item.orderNo || `PSL-${item.id}`,
                customer: item.stakeholder?.name || item.stakeholderName || (item.stakeholderId ? `Stakeholder #${item.stakeholderId}` : "Stakeholder"),
                netTotalFormatted: `৳${(Number(item.totalAmount || item.netTotal || 0)).toLocaleString()}`,
                dateFormatted: item.createdAt ? formatDhakaDate(item.createdAt) : "-",
              };
            })}
            columnMapping={{
              "Order ID": "orderNo",
              Stakeholder: "customer",
              "Net Amount": "netTotalFormatted",
              Status: "statusName",
              Date: "dateFormatted",
            }}
            columnAlignment={{
              SL: "center",
              "Order ID": "left",
              Stakeholder: "left",
              "Net Amount": "right",
              Status: "center",
              Date: "center",
              Action: "center",
            }}
            actionButtonsConfig={[
              {
                icon: <FaEye className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110" title="View Order Details & Print Invoice" />,
                show: () => true,
                onClick: (row) => {
                  setActiveReceiptOrder(row);
                  setRecentSalesOpen(false);
                  setReceiptOpen(true);
                },
              },
            ]}
          />
        </div>
      </CustomModal>

      {/* All Packaged Orders History Modal */}
      <CustomModal
        open={allHistoryOpen}
        setOpen={setAllHistoryOpen}
        header="All Packaged Sales  History"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          <DataTable
            headerConfig={{
              title: "All Packaged Sales History",
              searchPlaceholder: "Search packaged sales history by Ref, Invoice, Stakeholder...",
            }}
            tableHead={["SL", "Order Ref", "Invoice No", "Stakeholder", "Net Total", "Status", "Date", "Action"]}
            tableData={historyOrders.map((item) => {
              const statusValue =
                typeof item.invoice?.status === "object" && item.invoice?.status?.value
                  ? item.invoice.status.value
                  : typeof item.status === "object" && item.status?.value
                  ? item.status.value
                  : typeof item.status === "string"
                  ? item.status
                  : item.invoiceStatus || "Paid";

              return {
                ...item,
                status: statusValue,
                statusName: statusValue,
                orderNo: item.saleId || item.orderNo || `PSL-${item.id}`,
                invoiceNo: item.invoice?.invoiceId || item.invoiceNo || `INV-${item.id}`,
                customer: item.stakeholder?.name || item.stakeholderName || (item.stakeholderId ? `Stakeholder #${item.stakeholderId}` : "Stakeholder"),
                netTotalFormatted: `৳${(Number(item.totalAmount || item.netTotal || 0)).toLocaleString()}`,
                dateFormatted: item.createdAt ? formatDhakaDate(item.createdAt) : "-",
              };
            })}
            columnMapping={{
              "Order Ref": "orderNo",
              "Invoice No": "invoiceNo",
              Stakeholder: "customer",
              "Net Total": "netTotalFormatted",
              Status: "statusName",
              Date: "dateFormatted",
            }}
            columnAlignment={{
              SL: "left",
              "Order Ref": "left",
              "Invoice No": "left",
              Customer: "left",
              "Net Total": "right",
              Status: "center",
              Date: "center",
              Action: "center",
            }}
            actionButtonsConfig={[
              {
                icon: <FaEye className="text-emerald-600 hover:text-emerald-800 text-base transition transform hover:scale-110" title="View Order Details & Print Invoice" />,
                show: () => true,
                onClick: (row) => {
                  setActiveReceiptOrder(row);
                  setAllHistoryOpen(false);
                  setReceiptOpen(true);
                },
              },
            ]}
            loading={loading}
          />
        </div>
      </CustomModal>

      {/* Printable Receipt/Invoice Modal */}
      <ViewPackagedSaleModal
        open={receiptOpen}
        setOpen={setReceiptOpen}
        orderData={activeReceiptOrder}
      />
    </div>
  );
};

export default PackagedSales;
