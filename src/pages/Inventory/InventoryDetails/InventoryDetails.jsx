import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdArrowBack, MdAddCircle } from "react-icons/md";
import { FaBoxes, FaBoxOpen, FaSeedling, FaEdit } from "react-icons/fa";
import useInventory from "../../../hooks/useInventory";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { useAuthStore } from "../../../store/authStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import CreatePackageModal from "./CreatePackageModal";
import EditBulkModal from "./EditBulkModal";
import EditPackagedModal from "./EditPackagedModal";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ReadyToSellToggle = ({ isReady, onToggle, disabled }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="inline-flex items-center justify-center p-1 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 focus:outline-none"
      title={isReady ? "Ready to sell (Click to toggle)" : "Not for sale (Click to toggle)"}
    >
      <span
        className={`relative inline-block w-9 h-5 transition-colors duration-200 ease-in-out rounded-full ${
          isReady ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transition duration-200 ease-in-out transform bg-white rounded-full shadow mt-0.5 ${
            isReady ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
};

const InventoryDetails = () => {
  const { seedTypeId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const {
    getBulkInventory,
    getPackagedInventory,
    getOverallInventory,
    toggleReadyToSell,
    togglePackagedReadyToSell,
    loading,
  } = useInventory();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [activeTab, setActiveTab] = useState("bulk");
  const [bulkData, setBulkData] = useState([]);
  const [packagedData, setPackagedData] = useState([]);
  const [seedTypeName, setSeedTypeName] = useState("");
  const [seedStats, setSeedStats] = useState(null);
  const [openPackageModal, setOpenPackageModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [editBulkOpen, setEditBulkOpen] = useState(false);
  const [selectedBulk, setSelectedBulk] = useState(null);

  const [editPackagedOpen, setEditPackagedOpen] = useState(false);
  const [selectedPackaged, setSelectedPackaged] = useState(null);

  useEffect(() => {
    if (seedTypeId) {
      fetchData();
    }
  }, [seedTypeId]);

  const fetchData = async () => {
    // Fetch Overall Stats
    const overallRes = await getOverallInventory();
    if (overallRes.success) {
      const stats = overallRes.data?.find(
        (item) => String(item.seedTypeId) === String(seedTypeId),
      );
      if (stats) setSeedStats(stats);
    }

    // Fetch Bulk
    const bulkRes = await getBulkInventory(seedTypeId);
    if (bulkRes.success) {
      const dataObj = bulkRes.data?.data?.[seedTypeId];
      if (dataObj) {
        setSeedTypeName(dataObj.seedTypeName || "");
        const formattedBatches = (dataObj.batches || []).map((batch) => ({
          ...batch,
          procurementId: batch.procurementOrder?.procurementId || batch.procurementId || "-",
          formattedExpiryDate: batch.expiryDate
            ? formatDhakaDate(batch.expiryDate)
            : "-",
        }));
        setBulkData(formattedBatches);
      }
    } else {
      showToast(bulkRes.message, "error");
    }

    // Fetch Packaged
    const pkgRes = await getPackagedInventory(seedTypeId);
    if (pkgRes.success) {
      const pkgList =
        pkgRes.data?.data?.[seedTypeId]?.packages ||
        pkgRes.data?.data ||
        pkgRes.data ||
        [];
      if (Array.isArray(pkgList)) {
        const formattedPkg = pkgList.map((pkg) => ({
          ...pkg,
          formattedExpiryDate: pkg.expiryDate
            ? formatDhakaDate(pkg.expiryDate)
            : pkg.bulkInventory?.expiryDate
              ? formatDhakaDate(pkg.bulkInventory.expiryDate)
              : "-",
          formattedBatchId:
            pkg.bulkInventory?.batchId || pkg.bulkInventoryId || "-",
          formattedPacketSize: pkg.packetSize?.value
            ? `${pkg.packetSize.value}`
            : pkg.packetSizeId || "-",
        }));
        setPackagedData(formattedPkg);
      }
    } else {
      console.error(pkgRes.message);
    }
  };

  const handleToggleReady = async (id) => {
    setTogglingId(id);
    const res = await toggleReadyToSell(id);
    setTogglingId(null);
    if (res.success) {
      showToast(res.message || "Ready to sell status updated", "success");
      fetchData();
    } else {
      showToast(res.message, "error");
    }
  };

  const handleTogglePackagedReady = async (id) => {
    setTogglingId(id);
    const res = await togglePackagedReadyToSell(id);
    setTogglingId(null);
    if (res.success) {
      showToast(res.message || "Ready to sell status updated", "success");
      fetchData();
    } else {
      showToast(res.message, "error");
    }
  };

  const handleRefresh = () => {
    fetchData();
    setTriggerRefresh();
  };

  const bulkTableHead = [
    "Batch ID",
    "Procurement ID",
    "Quantity (Kg)",
    "Remaining Qty (Kg)",
    "Unit Price (BDT)",
    "Expiry Date",
    "Ready to Sell",
    "Status",
    "Action",
  ];

  const bulkColumnMapping = {
    "Batch ID": "batchId",
    "Procurement ID": "procurementId",
    "Quantity (Kg)": "quantity",
    "Remaining Qty (Kg)": "remainingQuantity",
    "Unit Price (BDT)": "unitPrice",
    "Expiry Date": "formattedExpiryDate",
    "Ready to Sell": "readyToSellToggle",
    Status: "status",
  };

  const bulkColumnAlignment = {
    "Batch ID": "left",
    "Procurement ID": "center",
    "Quantity (Kg)": "center",
    "Remaining Qty (Kg)": "center",
    "Unit Price (BDT)": "right",
    "Expiry Date": "center",
    "Ready to Sell": "center",
    Status: "center",
    Action: "center",
  };

  const BULK_ACTION_BUTTONS = [
    {
      show: () =>
        authUser?.permissions?.includes("SUPER") ||
        authUser?.permissions?.includes("UPDATE_BULK_INVENTORY"),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: (row) => {
        setSelectedBulk(row);
        setEditBulkOpen(true);
      },
      label: "Edit Bulk Inventory",
    },
  ];

  // Packaged Table Config
  const packagedTableHead = [
    "Package ID",
    "Batch ID",
    "Packet Size(gram)",
    "Quantity (Pcs)",
    "Remaining Qty (Pcs)",
    "Unit Price (BDT)",
    "Expiry Date",
    "Ready to Sell",
    "Action",
  ];

  const packagedColumnMapping = {
    "Package ID": "id",
    "Batch ID": "formattedBatchId",
    "Packet Size(gram)": "formattedPacketSize",
    "Quantity (Pcs)": "quantity",
    "Remaining Qty (Pcs)": "remainingQuantity",
    "Unit Price (BDT)": "unitPrice",
    "Expiry Date": "formattedExpiryDate",
    "Ready to Sell": "readyToSellToggle",
  };

  const packagedColumnAlignment = {
    "Package ID": "left",
    "Batch ID": "left",
    "Packet Size(gram)": "center",
    "Quantity (Pcs)": "center",
    "Remaining Qty (Pcs)": "center",
    "Unit Price (BDT)": "right",
    "Expiry Date": "center",
    "Ready to Sell": "center",
    Action: "center",
  };

  const PACKAGED_ACTION_BUTTONS = [
    {
      show: () =>
        authUser?.permissions?.includes("SUPER") ||
        authUser?.permissions?.includes("UPDATE_PACKAGED_INVENTORY"),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: (row) => {
        setSelectedPackaged(row);
        setEditPackagedOpen(true);
      },
      label: "Edit Packaged Inventory",
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MdArrowBack className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Inventory Details {seedTypeName && `- ${seedTypeName}`}
            </h2>
          </div>
        </div>

        {activeTab === "packaged" &&
          (authUser?.permissions?.includes("SUPER") ||
            authUser?.permissions?.includes("CREATE_PACKAGE")) && (
            <button
              onClick={() => setOpenPackageModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Create Package
            </button>
          )}
      </div>

      {/* Tabs & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-100 p-1.5 rounded-xl w-max space-x-2">
          <button
            onClick={() => setActiveTab("bulk")}
            className={`whitespace-nowrap py-2.5 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === "bulk"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/70"
            }`}
          >
            Bulk Inventory
          </button>
          <button
            onClick={() => setActiveTab("packaged")}
            className={`whitespace-nowrap py-2.5 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === "packaged"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/70"
            }`}
          >
            Packaged Inventory
          </button>
        </div>

        {seedStats && (
          <div className="flex items-center gap-6 bg-white border border-gray-200 rounded-xl px-5 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="font-bold text-primary-700">
                {seedStats.totalKg} Kg
              </span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <FaBoxes className="text-gray-400" /> Bulk:
              </span>
              <span className="font-bold text-gray-800">
                {seedStats.bulkKg} Kg
              </span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 flex items-center gap-1.5">
                <FaBoxOpen className="text-gray-400" /> Packaged:
              </span>
              <span className="font-bold text-gray-800">
                {seedStats.packagedKg} Kg
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "bulk" ? (
          <DataTable
            tableHead={bulkTableHead}
            tableData={bulkData.map((batch) => ({
              ...batch,
              readyToSellToggle: (
                <ReadyToSellToggle
                  isReady={!!batch.isReadyToSell}
                  onToggle={() => handleToggleReady(batch.id)}
                  disabled={togglingId === batch.id}
                />
              ),
            }))}
            columnMapping={bulkColumnMapping}
            columnAlignment={bulkColumnAlignment}
            loading={loading}
            actionButtonsConfig={BULK_ACTION_BUTTONS}
            headerConfig={{
              title: "Bulk Batches",
              searchPlaceholder: "Search bulk batches...",
            }}
          />
        ) : (
          <DataTable
            tableHead={packagedTableHead}
            tableData={packagedData.map((pkg) => ({
              ...pkg,
              readyToSellToggle: (
                <ReadyToSellToggle
                  isReady={!!pkg.isReadyToSell}
                  onToggle={() => handleTogglePackagedReady(pkg.id)}
                  disabled={togglingId === pkg.id}
                />
              ),
            }))}
            columnMapping={packagedColumnMapping}
            columnAlignment={packagedColumnAlignment}
            loading={loading}
            actionButtonsConfig={PACKAGED_ACTION_BUTTONS}
            headerConfig={{
              title: "Created Packages",
              searchPlaceholder: "Search packages...",
            }}
          />
        )}
      </div>

      <CreatePackageModal
        open={openPackageModal}
        setOpen={setOpenPackageModal}
        onSuccess={handleRefresh}
        seedTypeId={seedTypeId}
      />

      <EditBulkModal
        open={editBulkOpen}
        setOpen={setEditBulkOpen}
        rowData={selectedBulk}
        onSuccess={handleRefresh}
      />

      <EditPackagedModal
        open={editPackagedOpen}
        setOpen={setEditPackagedOpen}
        rowData={selectedPackaged}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default InventoryDetails;
