import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useInventory from "../../../hooks/useInventory";
import useLookUp from "../../../hooks/useLookup";
import usePOS from "../../../hooks/usePOS";
import usePOSLocation from "../../../hooks/usePOSLocation";
import { useAuthStore } from "../../../store/authStore";
import SearchableSelect from "../../../components/SearchableSelect";
import showToast from "../../../utils/toast";
import Swal from "sweetalert2";
import ReceiptModal from "./ReceiptModal";
import RecentSalesModal from "./RecentSalesModal";
import BranchSelectModal from "./BranchSelectModal";
import {
  FaCashRegister,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaHistory,
  FaUser,
  FaCheckCircle,
  FaRedo,
  FaMoneyBillWave,
  FaUniversity,
  FaMobileAlt,
  FaStickyNote,
  FaStore,
  FaBoxes,
  FaBoxOpen,
} from "react-icons/fa";

// Standard Eye-Comfort Payment Method Options
const DEFAULT_PAYMENT_METHODS = [
  { id: 1, value: "Cash", icon: FaMoneyBillWave },
  { id: 2, value: "Bank", icon: FaUniversity },
  { id: 3, value: "Mobile Banking", icon: FaMobileAlt },
];

const POS = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { getBulkReadyToSellList, getPackagedReadyToSellList } = useInventory();
  const { getLookup } = useLookUp();
  const { submittingOrder, getPaymentMethods, createPOSOrder, getPOSOrders } = usePOS();
  const { getMyPOSLocations } = usePOSLocation();

  // Branch / Location Selection State
  const [assignedBranches, setAssignedBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [fetchingBranches, setFetchingBranches] = useState(false);

  // 1. Seed Type Selection & Lookups
  const [seedTypes, setSeedTypes] = useState([]);
  const [selectedSeedTypeId, setSelectedSeedTypeId] = useState("");

  // 2. Ready to Sell Lists (Bulk & Packaged)
  const [sourceType, setSourceType] = useState("bulk"); // 'bulk' | 'packaged'
  const [bulkList, setBulkList] = useState([]);
  const [packagedList, setPackagedList] = useState([]);
  const [fetchingList, setFetchingList] = useState(false);

  // Item Selector Form State
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  // Cart State
  const [cart, setCart] = useState([]);

  // Customer, Note & Payment Form State
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);
  const [paymentMethodId, setPaymentMethodId] = useState(1);
  const [discountType, setDiscountType] = useState("flat"); // "flat" | "percentage"
  const [discountValue, setDiscountValue] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");

  // Modals & History (Persisted in localStorage)
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [activeOrderData, setActiveOrderData] = useState(null);
  const [recentSalesOpen, setRecentSalesOpen] = useState(false);
  const [salesHistory, setSalesHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("circle_seed_pos_sales_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadingRecentSales, setLoadingRecentSales] = useState(false);

  // Fetch last 10 sales from GET API
  const fetchRecentSales = useCallback(async () => {
    setLoadingRecentSales(true);
    const res = await getPOSOrders({ limit: 10, page: 1 });
    if (res.success && Array.isArray(res.data)) {
      const formatted = res.data.slice(0, 10).map((item) => ({
        ...item,
        invoiceId:
          item.invoice?.invoiceId ||
          item.invoiceId ||
          item.invoiceNo ||
          (item.id ? `INV-${item.id}` : null),
        orderId:
          item.invoice?.invoiceId ||
          item.invoiceId ||
          item.invoiceNo ||
          item.posId ||
          (item.id ? `INV-${item.id}` : null),
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : new Date().toLocaleString(),
        customerName: item.customerName || item.customer || "Walk-in Customer",
        customerContact: item.customerContact || item.contact || "",
        paymentMethodName: item.paymentMethod?.value || item.paymentMethodName || "Cash",
        subtotal: Number(item.subtotal || item.totalAmount || 0),
        discountType: item.discountType || "flat",
        discountValue: Number(item.discountValue || 0),
        calculatedDiscount: Number(item.calculatedDiscount || item.discountAmount || 0),
        grandTotal: Number(item.totalAmount || item.grandTotal || item.subtotal || 0),
        paidAmount: Number(item.paidAmount || item.totalAmount || item.grandTotal || 0),
        changeAmount: Number(item.changeAmount || 0),
        note: item.note || "",
        items: (item.items || []).map((it) => ({
          ...it,
          seedTypeName:
            it.seedTypeName ||
            it.seedType?.name ||
            it.packagedInventory?.bulkInventory?.seedType?.name ||
            "Packaged Item",
          packetSize:
            it.packetSize?.value
              ? `${it.packetSize.value}g`
              : typeof it.packetSize === "string"
              ? it.packetSize
              : it.packetSizeId
              ? `${it.packetSizeId}g`
              : "Pack",
          batchId:
            it.batchId ||
            it.packagedInventory?.bulkInventory?.batchId ||
            "",
          quantity: Number(it.quantity || 1),
          unitPrice: Number(it.unitPrice || 0),
        })),
      }));
      setSalesHistory(formatted);
    }
    setLoadingRecentSales(false);
  }, [getPOSOrders]);

  // Sync sales history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("circle_seed_pos_sales_history", JSON.stringify(salesHistory));
    } catch (e) {
      console.error("Failed to save POS sales history to localStorage", e);
    }
  }, [salesHistory]);

  // Fetch recent sales on mount
  useEffect(() => {
    fetchRecentSales();
  }, [fetchRecentSales]);

  // Fetch assigned POS locations for current user on mount
  useEffect(() => {
    const fetchUserBranches = async () => {
      setFetchingBranches(true);
      const res = await getMyPOSLocations();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const branches = res.data;
        setAssignedBranches(branches);

        // Check if previously selected branch exists in sessionStorage
        const savedStr = sessionStorage.getItem("circle_seed_pos_selected_branch");
        let savedBranch = null;
        if (savedStr) {
          try {
            savedBranch = JSON.parse(savedStr);
          } catch (e) {}
        }

        const match = savedBranch && branches.find((b) => String(b.id) === String(savedBranch.id));
        if (match) {
          setSelectedBranch(match);
        } else if (branches.length === 1) {
          setSelectedBranch(branches[0]);
          sessionStorage.setItem("circle_seed_pos_selected_branch", JSON.stringify(branches[0]));
        } else {
          setBranchModalOpen(true);
        }
      } else {
        setAssignedBranches([]);
        setBranchModalOpen(true);
      }
      setFetchingBranches(false);
    };

    fetchUserBranches();
  }, [getMyPOSLocations]);

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    try {
      sessionStorage.setItem("circle_seed_pos_selected_branch", JSON.stringify(branch));
    } catch (e) {}
    showToast(`Active Branch: ${branch.name}`, "success");
  };

  // Fetch Seed Types & Payment Methods on mount
  useEffect(() => {
    const fetchInitialLookups = async () => {
      const [resSeed, resPay] = await Promise.all([
        getLookup("seed_type"),
        getPaymentMethods(),
      ]);

      if (resSeed.success) {
        setSeedTypes(resSeed.data || []);
      }

      if (resPay.success && resPay.data?.length) {
        const fetchedList = resPay.data;
        setPaymentMethods(fetchedList);
        if (fetchedList[0]?.id) {
          setPaymentMethodId(fetchedList[0].id);
        }
      } else {
        setPaymentMethods(DEFAULT_PAYMENT_METHODS);
      }
    };

    fetchInitialLookups();
  }, []);

  // Fetch ready to sell items (both bulk & packaged) whenever selectedSeedTypeId changes
  useEffect(() => {
    if (selectedSeedTypeId) {
      fetchReadyToSellItems(selectedSeedTypeId);
    } else {
      setBulkList([]);
      setPackagedList([]);
    }
    setSelectedItemId("");
    setQuantity("1");
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

  // Prefill unit price when selectedItemId or sourceType changes
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

  // Handle Adding item to Cart from Form (Bulk & Packaged)
  const handleAddItemFromForm = (e) => {
    e.preventDefault();

    if (!selectedSeedTypeId) {
      showToast("Please select a Seed Type", "error");
      return;
    }

    if (!selectedItemId) {
      showToast(`Please select a ${sourceType === "bulk" ? "Bulk Batch" : "Packaged Package"}`, "error");
      return;
    }

    const qtyNum = Number(quantity);
    const priceNum = Number(unitPrice);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      showToast("Please enter a valid quantity greater than 0", "error");
      return;
    }

    const seedTypeObj = seedTypes.find((s) => String(s.id) === String(selectedSeedTypeId));
    const seedTypeName = seedTypeObj ? seedTypeObj.value : "Seed Product";

    if (sourceType === "bulk") {
      const bulkItem = bulkList.find((i) => String(i.id) === String(selectedItemId));
      if (!bulkItem) return;

      const availQty = Number(bulkItem.remainingQuantity || 0);

      const existingInCart = cart.find(
        (item) => item.sourceType === "bulk" && Number(item.bulkInventoryId) === Number(bulkItem.id)
      );
      const currentCartQty = existingInCart ? existingInCart.quantity : 0;

      if (currentCartQty + qtyNum > availQty) {
        showToast(`Total quantity (${currentCartQty + qtyNum} Kg) exceeds available stock (${availQty} Kg)`, "error");
        return;
      }

      const existingIndex = cart.findIndex(
        (c) => c.sourceType === "bulk" && Number(c.bulkInventoryId) === Number(bulkItem.id)
      );

      if (existingIndex > -1) {
        const updatedCart = [...cart];
        updatedCart[existingIndex].quantity += qtyNum;
        setCart(updatedCart);
      } else {
        setCart([
          ...cart,
          {
            id: `cart-bulk-${bulkItem.id}-${Date.now()}`,
            sourceType: "bulk",
            bulkInventoryId: Number(bulkItem.id),
            seedTypeId: selectedSeedTypeId,
            seedTypeName,
            batchId: bulkItem.batchId || "N/A",
            packetSize: "Bulk (Kg)",
            unitLabel: "Kg",
            quantity: qtyNum,
            unitPrice: priceNum,
            availableStock: availQty,
          },
        ]);
      }

      showToast(`Added ${seedTypeName} Bulk (Batch: ${bulkItem.batchId}) to order`, "success");
    } else {
      const pkgItem = packagedList.find((i) => String(i.id) === String(selectedItemId));
      if (!pkgItem) return;

      const availQty = Number(pkgItem.remainingQuantity || 0);

      const existingInCart = cart.find(
        (item) => item.sourceType === "packaged" && Number(item.packagedInventoryId) === Number(pkgItem.id)
      );
      const currentCartQty = existingInCart ? existingInCart.quantity : 0;

      if (currentCartQty + qtyNum > availQty) {
        showToast(`Total quantity (${currentCartQty + qtyNum} Pcs) exceeds available stock (${availQty} Pcs)`, "error");
        return;
      }

      const packetSizeVal = pkgItem.packetSize?.value
        ? `${pkgItem.packetSize.value}g`
        : pkgItem.packetSizeId
        ? `${pkgItem.packetSizeId}g`
        : "Pack";

      const batchId = pkgItem.bulkInventory?.batchId || pkgItem.bulkInventoryId || "N/A";

      const existingIndex = cart.findIndex(
        (c) => c.sourceType === "packaged" && Number(c.packagedInventoryId) === Number(pkgItem.id)
      );

      if (existingIndex > -1) {
        const updatedCart = [...cart];
        updatedCart[existingIndex].quantity += qtyNum;
        setCart(updatedCart);
      } else {
        setCart([
          ...cart,
          {
            id: `cart-packaged-${pkgItem.id}-${Date.now()}`,
            sourceType: "packaged",
            packagedInventoryId: Number(pkgItem.id),
            seedTypeId: selectedSeedTypeId,
            seedTypeName,
            batchId,
            packetSize: packetSizeVal,
            unitLabel: "Pcs",
            quantity: qtyNum,
            unitPrice: priceNum,
            availableStock: availQty,
          },
        ]);
      }

      showToast(`Added ${seedTypeName} Packaged (${packetSizeVal}) to order`, "success");
    }

    setSelectedItemId("");
    setQuantity("1");
    setUnitPrice("");
  };

  // Cart Qty Modifiers
  const handleUpdateCartQty = (cartItemId, delta) => {
    const existingIndex = cart.findIndex((item) => item.id === cartItemId);
    if (existingIndex === -1) return;

    const updatedCart = [...cart];
    const currentItem = updatedCart[existingIndex];
    const newQty = currentItem.quantity + delta;

    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }

    if (newQty > currentItem.availableStock) {
      showToast(`Quantity cannot exceed available stock (${currentItem.availableStock} ${currentItem.unitLabel || "Pcs"})`, "warning");
      return;
    }

    updatedCart[existingIndex].quantity = newQty;
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (cartItemId) => {
    setCart(cart.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Financial Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const calculatedDiscount = useMemo(() => {
    const val = Number(discountValue || 0);
    if (discountType === "percentage") {
      return (subtotal * val) / 100;
    }
    return Math.min(val, subtotal);
  }, [subtotal, discountType, discountValue]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - calculatedDiscount);
  }, [subtotal, calculatedDiscount]);

  const changeAmount = useMemo(() => {
    const paid = Number(paidAmount || 0);
    return paid > 0 ? paid - grandTotal : 0;
  }, [paidAmount, grandTotal]);

  const handleQuickCashPreset = (amount) => {
    if (amount === "exact") {
      setPaidAmount(grandTotal.toString());
    } else {
      const current = Number(paidAmount || 0);
      setPaidAmount((current + amount).toString());
    }
  };

  // Checkout Handler
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!selectedBranch) {
      showToast("Please select an active POS branch before creating an order.", "warning");
      setBranchModalOpen(true);
      return;
    }

    if (!customerName.trim()) {
      showToast("Please enter Customer Name", "warning");
      return;
    }

    if (!customerContact.trim()) {
      showToast("Please enter Customer Contact Number", "warning");
      return;
    }

    if (!paymentMethodId) {
      showToast("Please select a payment method", "warning");
      return;
    }

    const branchId = Number(selectedBranch.id);

    const payload = {
      locationId: branchId,
      posLocationId: branchId,
      customerName: customerName.trim(),
      customerContact: customerContact.trim(),
      paymentMethodId: Number(paymentMethodId),
      discountType: discountType || "flat",
      discountValue: Number(discountValue || 0),
      note: (note || "").trim(),
      items: cart.map((item) => {
        if (item.sourceType === "bulk" || (item.bulkInventoryId && !item.packagedInventoryId)) {
          return {
            bulkInventoryId: Number(item.bulkInventoryId),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice || 0),
          };
        } else {
          return {
            packagedInventoryId: Number(item.packagedInventoryId),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice || 0),
          };
        }
      }),
    };

    console.log("POS Checkout Payload:", payload);

    Swal.fire({
      title: "Confirm POS Sale?",
      html: `
        <div style="text-align: left; font-size: 13px; color: #334155; line-height: 1.6;">
          <p><strong>Customer:</strong> ${payload.customerName}</p>
          <p><strong>Total Items:</strong> ${cart.length} ${cart.length === 1 ? "item" : "items"}</p>
          <p><strong>Grand Total:</strong> <span style="color: #059669; font-weight: bold; font-size: 15px;">৳${grandTotal.toLocaleString()}</span></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, Complete Order",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await createPOSOrder(payload);

        if (res.success) {
          showToast(res.message || "POS Sale completed successfully!", "success");

          const selectedPayMethod = paymentMethods.find(
            (m) => String(m.id) === String(paymentMethodId)
          );

          const completedOrderData = {
            locationId: branchId,
            posLocationId: branchId,
            locationName: selectedBranch?.name || "",
            invoiceId: res.data?.invoiceId || res.data?.invoiceNo || res.data?.invoice?.invoiceId || (res.data?.id ? `INV-${res.data.id}` : null),
            orderId: res.data?.invoiceId || res.data?.invoiceNo || res.data?.invoice?.invoiceId || res.data?.orderId || (res.data?.id ? `INV-${res.data.id}` : `INV-${Date.now()}`),
            date: new Date().toLocaleString(),
            customerName: payload.customerName,
            customerContact: payload.customerContact,
            paymentMethodName: selectedPayMethod ? selectedPayMethod.value : "Cash",
            items: [...cart],
            subtotal: subtotal,
            discountType: discountType,
            discountValue: Number(discountValue || 0),
            calculatedDiscount: calculatedDiscount,
            grandTotal: grandTotal,
            paidAmount: Number(paidAmount || grandTotal),
            changeAmount: changeAmount,
            note: payload.note,
            isFreshCheckout: true,
          };

          setSalesHistory((prev) => [completedOrderData, ...prev.slice(0, 9)]);
          setActiveOrderData(completedOrderData);
          setReceiptOpen(true);
          fetchRecentSales();

          if (selectedSeedTypeId) {
            fetchReadyToSellItems(selectedSeedTypeId);
          }

          resetPOSForm();
        } else {
          showToast(res.message || "Failed to process POS order", "error");
        }
      }
    });
  };

  const handleOpenRecentSales = () => {
    fetchRecentSales();
    setRecentSalesOpen(true);
  };

  const resetPOSForm = () => {
    setCart([]);
    setSelectedItemId("");
    setQuantity("1");
    setUnitPrice("");
    setCustomerName("");
    setCustomerContact("");
    setNote("");
    setDiscountValue(0);
    setPaidAmount("");
  };

  // Options for item select dropdown based on current sourceType (Bulk vs Packaged)
  const currentItemOptions =
    sourceType === "bulk"
      ? bulkList.map((item) => ({
          id: item.id,
          label: `Batch: ${item.batchId} | Stock: ${item.remainingQuantity} Kg | BDT ${item.unitPrice}/Kg`,
        }))
      : packagedList.map((item) => ({
          id: item.id,
          label: `${item.bulkInventory?.batchId ? `Batch: ${item.bulkInventory.batchId} - ` : ""}Size: ${
            item.packetSize?.value ? `${item.packetSize.value}g` : `${item.packetSizeId}g` || "N/A"
          } | Stock: ${item.remainingQuantity} Pcs | BDT ${item.unitPrice}/Pcs`,
        }));

  // Cashier Display String (Name and ID)
  const cashierDisplayName = authUser?.fullName || authUser?.name || authUser?.username || "Store Executive";
  const cashierDisplayId = authUser?.employeeId || authUser?.id ? ` (ID: ${authUser?.employeeId || authUser?.id})` : "";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto bg-slate-50/70 min-h-screen text-slate-800">
      {/* Eye-Comfort Screen Header (Compressed & Sleek) */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <FaCashRegister className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 tracking-tight">POS Sales Register</h2>
              {selectedBranch ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  <FaStore className="h-3 w-3 text-emerald-600" />
                  <span>{selectedBranch.name}</span>
                  {assignedBranches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBranchModalOpen(true)}
                      className="ml-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-950 underline"
                    >
                      Switch
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                >
                  <FaStore className="h-3 w-3 text-amber-600" />
                  Select Branch
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Cashier: <span className="text-slate-700 font-bold">{cashierDisplayName}{cashierDisplayId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={resetPOSForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition"
          >
            <FaRedo className="w-3 h-3 text-slate-400" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => navigate("/sales/pos-history")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition shadow-2xs"
          >
            <FaHistory className="w-3 h-3 text-emerald-400" /> All POS History
          </button>

          <button
            type="button"
            onClick={handleOpenRecentSales}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-2xs"
          >
            <FaHistory className="w-3 h-3" /> Recent ({salesHistory.length})
          </button>
        </div>
      </div>

      {/* Main 2-Column Eye-Comfort Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Item Selector Form & Order Cart Items Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1 & 2: Item Selector Card */}
          <form onSubmit={handleAddItemFromForm} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Select Seed & Ready-to-Sell Inventory
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Bulk & Packaged Sales
              </span>
            </h3>

            {/* Row 1: 3-column layout matching QuotationCalculator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Seed Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
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

              {/* 2. Inventory Type (Bulk vs Packaged) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  2. Inventory Type <span className="text-emerald-600">*</span>
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType("bulk");
                      setSelectedItemId("");
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      sourceType === "bulk"
                        ? "bg-white text-emerald-700 shadow-2xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-800"
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
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      sourceType === "packaged"
                        ? "bg-white text-emerald-700 shadow-2xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    <FaBoxOpen className="w-3.5 h-3.5" />
                    Packaged
                  </button>
                </div>
              </div>

              {/* 3. Batch / Package Ready to Sell */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  3. Select {sourceType === "bulk" ? "Bulk Batch" : "Packaged Package"} <span className="text-emerald-600">*</span>
                </label>
                <SearchableSelect
                  options={currentItemOptions}
                  value={selectedItemId}
                  onChange={setSelectedItemId}
                  placeholder={
                    !selectedSeedTypeId
                      ? "Select Seed Type first..."
                      : fetchingList
                      ? "Loading ready items..."
                      : currentItemOptions.length === 0
                      ? `No ready-to-sell ${sourceType} items`
                      : `Select ${sourceType === "bulk" ? "Batch" : "Package"}...`
                  }
                  getOptionLabel={(opt) => opt.label}
                  getOptionValue={(opt) => opt.id}
                />
              </div>
            </div>

            {/* Row 2: Quantity, Unit Price & Add Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Quantity ({sourceType === "bulk" ? "Kg" : "Pcs"}) <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.01"
                  step="any"
                  required
                  placeholder={sourceType === "bulk" ? "e.g. 10" : "e.g. 5"}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Unit Price (BDT / {sourceType === "bulk" ? "Kg" : "Pcs"})
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  disabled
                  readOnly
                  placeholder="Price"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-slate-100 text-slate-500 font-mono font-bold focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!selectedItemId || !quantity || fetchingList}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </form>

          {/* Cart Items Table Container */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FaShoppingCart className="text-emerald-600" /> Order Cart Items ({cart.length})
                {cart.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </span>
                )}
              </h3>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                >
                  <FaTrash size={11} /> Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                <FaShoppingCart className="mx-auto text-3xl text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No items added to cart</p>
                <p className="text-[11px] text-slate-400 max-w-[260px] mx-auto">
                  Select Seed Type, Inventory Type (Bulk/Packaged) & Batch/Package, then click Add to Cart.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Item / Seed Type</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Size / Batch</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total (BDT)</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {item.seedTypeName}
                        </td>
                        <td className="py-3 px-3">
                          {item.sourceType === "bulk" ? (
                            <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              Bulk
                            </span>
                          ) : (
                            <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              Packaged
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                            {item.packetSize}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                          ৳{item.unitPrice.toLocaleString()}/{item.unitLabel || "Pcs"}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-lg w-max mx-auto">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-xs font-bold shadow-2xs transition"
                            >
                              <FaMinus size={8} />
                            </button>
                            <span className="w-10 text-center font-bold text-xs text-slate-800">
                              {item.quantity} {item.unitLabel || "Pcs"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-xs font-bold shadow-2xs transition"
                            >
                              <FaPlus size={8} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 font-mono">
                          ৳{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition"
                            title="Remove item"
                          >
                            <FaTrash size={12} />
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

        {/* Right Column: Customer Info, Payment Method & Calculation Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-5">
          {/* Clean Checkout Form */}
          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-emerald-600" /> Customer Details
                </span>
                <span className="text-[10px] text-red-500 font-semibold">* Mandatory</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Contact No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contact No. *"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Dropdown & Discount Controls */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Clean Payment Method Dropdown with Cash, Bank, Mobile Banking */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Payment Method <span className="text-emerald-600">*</span>
                  </label>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount Type Toggle */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Discount Type
                  </label>
                  <div className="flex rounded-lg border border-slate-300 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setDiscountType("flat")}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-md transition ${
                        discountType === "flat"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Flat (৳)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("percentage")}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-md transition ${
                        discountType === "percentage"
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      % Percent
                    </button>
                  </div>
                </div>
              </div>

              {/* Discount Value & Paid Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Discount ({discountType === "percentage" ? "%" : "৳"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tendered Cash (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder={grandTotal ? `${grandTotal}` : "0"}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Note Field */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <FaStickyNote className="text-slate-400" /> Order Note / Remarks
                </label>
                <input
                  type="text"
                  placeholder="Order note / remarks (Optional)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

            </div>

            {/* Eye-Comfort Calculation Summary Box */}
            <div className="bg-slate-800 text-white p-4 rounded-xl space-y-2 shadow-inner">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-৳{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-slate-700">
                <span className="text-slate-100">Grand Total</span>
                <span className="text-emerald-400 text-lg">৳{grandTotal.toLocaleString()}</span>
              </div>

              {Number(paidAmount || 0) > 0 && (
                <div className="flex justify-between text-xs pt-1 border-t border-slate-700/60 font-medium">
                  <span className="text-slate-400">Change Due</span>
                  <span className={changeAmount >= 0 ? "text-sky-300 font-bold" : "text-rose-400 font-bold"}>
                    ৳{changeAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Complete Sale Primary Button */}
            <button
              type="submit"
              disabled={
                submittingOrder ||
                cart.length === 0 ||
                !customerName.trim() ||
                !customerContact.trim()
              }
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              {submittingOrder ? (
                "Processing POS Order..."
              ) : (
                <>
                  <FaCheckCircle /> Complete Order & Print Invoice (৳{grandTotal.toLocaleString()})
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        setOpen={setReceiptOpen}
        orderData={activeOrderData}
        onNewSale={resetPOSForm}
      />

      {/* Recent Sales History Modal */}
      <RecentSalesModal
        open={recentSalesOpen}
        setOpen={setRecentSalesOpen}
        salesHistory={salesHistory}
        loading={loadingRecentSales}
        onSelectOrder={(order) => {
          setRecentSalesOpen(false);
          setActiveOrderData(order);
          setReceiptOpen(true);
        }}
      />

      {/* Branch Selection Modal */}
      <BranchSelectModal
        open={branchModalOpen}
        setOpen={setBranchModalOpen}
        locations={assignedBranches}
        selectedBranch={selectedBranch}
        onSelectBranch={handleSelectBranch}
        loading={fetchingBranches}
        allowClose={!!selectedBranch}
      />
    </div>
  );
};

export default POS;
