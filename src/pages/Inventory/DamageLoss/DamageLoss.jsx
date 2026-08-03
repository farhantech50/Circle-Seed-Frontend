import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import useInventoryAdjustment from "../../../hooks/useInventoryAdjustment";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import { useAuthStore } from "../../../store/authStore";
import DataTable from "../../../components/DataTable";
import showToast from "../../../utils/toast";
import CreateDamageLossModal from "./CreateDamageLossModal";
import ViewDamageLossModal from "./ViewDamageLossModal";
import useLookUp from "../../../hooks/useLookup";
import SearchableSelect from "../../../components/SearchableSelect";
import { formatDhakaDate } from "../../../utils/dateUtils";

const DamageLoss = () => {
  const { getAdjustments, deleteAdjustment, loading } = useInventoryAdjustment();

  const { authUser } = useAuthStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [adjustments, setAdjustments] = useState([]);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [open, setOpen] = useState(false);
  
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Filters
  const { getLookup } = useLookUp();
  const [reasonId, setReasonId] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [seedTypeId, setSeedTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [reasons, setReasons] = useState([]);
  const [seedTypes, setSeedTypes] = useState([]);

  useEffect(() => {
    const fetchLookups = async () => {
      const [resReasons, resSeedTypes] = await Promise.all([
        getLookup("inventoryAdjustmentReason"),
        getLookup("seed_type"),
      ]);
      if (resReasons.success) setReasons([{ id: "", value: "All Reasons" }, ...resReasons.data]);
      if (resSeedTypes.success) setSeedTypes([{ id: "", value: "All Seed Types" }, ...resSeedTypes.data]);
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [page, limit, search, triggerRefresh, reasonId, sourceType, seedTypeId, startDate, endDate]);

  const fetchAdjustments = async () => {
    const res = await getAdjustments({
      page,
      limit,
      search,
      reasonId,
      sourceType,
      seedTypeId,
      startDate,
      endDate,
    });
    if (res.success) {
      setAdjustments(
        res.data?.data?.map((item) => {
          const isPackaged = item.sourceType === "packaged";
          const ref = isPackaged 
            ? `Pkg ID: ${item.packagedInventory?.id || "-"}`
            : `Batch: ${item.bulkInventory?.batchId || "-"}`;
          const seed = isPackaged
            ? item.packagedInventory?.seedType?.value || "-"
            : item.bulkInventory?.seedType?.value || "-";

          return {
            ...item,
            dateFormatted: item.createdAt ? formatDhakaDate(item.createdAt) : "-",
            sourceTypeFormatted: isPackaged ? "Packaged" : "Bulk",
            inventoryRef: ref,
            seedType: seed,
          };
        }) || []
      );
      setTotalData(res.data?.total || 0);
    } else {
      setAdjustments([]);
      showToast(res.message, "error");
    }
  };

  const handleEdit = (row) => {
    setSelectedAdjustment(row);
    setOpen(true);
  };

  const handleView = (row) => {
    setViewData(row);
    setViewOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Adjustment?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteAdjustment(id);

      if (res.success) {
        setTriggerRefresh();
        Swal.fire({
          title: "Deleted!",
          text: res.message,
          icon: "success",
          confirmButtonColor: "#0D9488",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.message,
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    });
  };

  const tableHead = [
    "SL",
    "Date",
    "Source Type",
    "Inventory Ref",
    "Seed Type",
    "Reason",
    "Quantity",
    "Action",
  ];

  const columnMapping = {
    "Date": "dateFormatted",
    "Source Type": "sourceTypeFormatted",
    "Inventory Ref": "inventoryRef",
    "Seed Type": "seedType",
    "Reason": "reason",
    "Quantity": "quantity",
  };

  const columnAlignment = {
    SL: "left",
    "Date": "left",
    "Source Type": "center",
    "Inventory Ref": "left",
    "Seed Type": "left",
    "Reason": "left",
    "Quantity": "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () =>
        authUser?.permissions?.includes("SUPER") ||
        authUser?.permissions?.includes("VIEW_DAMAGE_LOSS"),
      icon: <FaEye className="text-lime-500 w-5 h-5" />,
      onClick: handleView,
      label: "View Details",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex flex-row items-center gap-2 md:gap-3 w-full xl:flex-1">
          <div className="flex-1 min-w-[100px] md:min-w-[120px]">
            <SearchableSelect
              options={reasons}
              value={reasonId}
              onChange={setReasonId}
              placeholder="Reason"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>
          <div className="flex-1 min-w-[100px] md:min-w-[120px]">
            <SearchableSelect
              options={seedTypes}
              value={seedTypeId}
              onChange={setSeedTypeId}
              placeholder="Seed Type"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>
          <div className="flex-1 min-w-[100px] md:min-w-[120px]">
            <SearchableSelect
              options={[
                { id: "", value: "All Sources" },
                { id: "bulk", value: "Bulk" },
                { id: "packaged", value: "Packaged" },
              ]}
              value={sourceType}
              onChange={setSourceType}
              placeholder="Source Type"
              getOptionLabel={(opt) => opt.value}
              getOptionValue={(opt) => opt.id}
            />
          </div>
          <div className="flex-1 min-w-[100px] md:min-w-[120px]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 md:px-3 py-[9px] text-sm bg-white"
              title="Start Date"
            />
          </div>
          <div className="flex-1 min-w-[100px] md:min-w-[120px]">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-2 md:px-3 py-[9px] text-sm bg-white"
              title="End Date"
            />
          </div>
        </div>

        {(authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("CREATE_DAMAGE_LOSS")) && (
          <div className="shrink-0 flex justify-end">
            <button
              onClick={() => {
                setSelectedAdjustment(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover whitespace-nowrap"
            >
              <MdAddCircle className="h-5 w-5" />
              Add Damage/Loss
            </button>
          </div>
        )}
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={adjustments}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Damage & Loss Adjustments",
          searchPlaceholder: "Search adjustments...",
        }}
      />

      <CreateDamageLossModal
        open={open}
        setOpen={setOpen}
        adjustmentData={selectedAdjustment}
      />

      <ViewDamageLossModal
        open={viewOpen}
        setOpen={setViewOpen}
        adjustmentData={viewData}
      />
    </div>
  );
};

export default DamageLoss;
