import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import useSupplier from "../../../hooks/useSupplier";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../store/paginationStore";
import { useAuthStore } from "../../../store/authStore";
import DataTable from "../../../components/DataTable";
import Lookup from "../../../components/Lookup";
import showToast from "../../../utils/toast";
import CreateSupplierModal from "./CreateSupplierModal";
import ViewSupplierModal from "./ViewSupplierModal";

const Supplier = () => {
  const { getSuppliers, deleteSupplier, loading } = useSupplier();

  const { authUser } = useAuthStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { page, limit, search, setTotalData } = usePaginationStore();

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [selectedStakeholderType, setSelectedStakeholderType] = useState("");

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [page, limit, search, triggerRefresh, selectedStakeholderType]);

  const fetchSuppliers = async () => {
    const res = await getSuppliers({
      page,
      limit,
      search,
      stakeholderTypeId: selectedStakeholderType,
    });
    if (res.success) {
      setSuppliers(
        res.data?.data?.map((item) => ({
          ...item,
          stakeholderType: item.stakeholderType?.value || "-",
          commissionFormatted: item.commissionPercentage !== undefined && item.commissionPercentage !== null ? `${item.commissionPercentage}%` : "-",
          status: item.isActive ? "Active" : "Inactive",
        })),
      );
      setTotalData(res.data?.total);
    } else {
      setSuppliers([]);
      showToast(res.message, "error");
    }
  };

  const handleView = (row) => {
    setSelectedSupplier(row);
    setViewOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedSupplier(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Stakeholder?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const res = await deleteSupplier(id);

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
    "Stakeholder ID",
    "Stakeholder Name",
    "Company",
    "Stakeholder Type",
    "Commission (%)",
    "Contact",
    "Status",
    "Action",
  ];

  const columnMapping = {
    "Stakeholder ID": "stakeholderId",
    "Stakeholder Name": "name",
    Company: "companyName",
    "Stakeholder Type": "stakeholderType",
    "Commission (%)": "commissionFormatted",
    Contact: "contact",
    Status: "status",
  };

  const columnAlignment = {
    SL: "left",
    "Stakeholder ID": "left",
    "Stakeholder Name": "left",
    Company: "left",
    "Stakeholder Type": "left",
    "Commission (%)": "center",
    Contact: "center",
    Status: "center",
    Action: "center",
  };

  const ACTION_BUTTONS = [
    {
      show: () => true,
      icon: <FaEye className="w-5 h-5 text-green-500" />,
      onClick: handleView,
      label: "View Stakeholder",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("UPDATE_SUPPLIER"),
        ),
      icon: <FaEdit className="w-5 h-5 text-blue-500" />,
      onClick: handleEdit,
      label: "Edit Stakeholder",
    },
    {
      show: () =>
        Boolean(
          authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("DELETE_SUPPLIER"),
        ),
      icon: <FaTrash className="w-5 h-5 text-red-500" />,
      onClick: (row) => handleDelete(row.id),
      label: "Delete Stakeholder",
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-primary-700">
            Stakeholder Type
          </label>

          <Lookup
            lookupName="stakeholderType"
            selectedId={selectedStakeholderType}
            setSelectedId={setSelectedStakeholderType}
          />
        </div>

        <div className="flex items-end">
          {(authUser?.permissions?.includes("SUPER") ||
            authUser?.permissions?.includes("CREATE_SUPPLIER")) && (
            <button
              onClick={() => {
                setSelectedSupplier(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
            >
              <MdAddCircle className="h-5 w-5" />
              Create Stakeholder
            </button>
          )}
        </div>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={suppliers}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        loading={loading}
        actionButtonsConfig={ACTION_BUTTONS}
        headerConfig={{
          title: "Stakeholder Directory",
          searchPlaceholder:
            "Search Stakeholder by ID, Name, Company, or Contact",
        }}
      />

      <CreateSupplierModal
        open={open}
        setOpen={setOpen}
        supplierData={selectedSupplier}
        setSupplierData={setSelectedSupplier}
      />

      <ViewSupplierModal
        open={viewOpen}
        setOpen={setViewOpen}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default Supplier;
