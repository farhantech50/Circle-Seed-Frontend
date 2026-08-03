import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaPlus, FaIndustry } from "react-icons/fa6";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const BatchProduction = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      batchno: "BCH-001",
      productname: "Circle Rice - BR28",
      quantity: "5000",
      proddate: "2026-06-10",
      status: "Completed",
    },
    {
      id: 2,
      batchno: "BCH-002",
      productname: "Circle Tomato - Red King",
      quantity: "200",
      proddate: "2026-06-12",
      status: "In Progress",
    },
    {
      id: 3,
      batchno: "BCH-003",
      productname: "Circle Potato - Diamond",
      quantity: "15000",
      proddate: "2026-06-15",
      status: "Pending",
    },
  ]);

  // Table Configuration
  const tableHead = [
    "SL",
    "Batch No",
    "Product Name",
    "Target Qty",
    "Prod. Date",
    "Status",
    "Action",
  ];

  const columnMapping = {
    "Batch No": "batchno",
    "Product Name": "productname",
    "Target Qty": "quantity",
    "Prod. Date": "proddate",
    Status: "status",
  };

  const columnAlignment = {
    SL: "center",
    "Batch No": "left",
    "Target Qty": "right",
    Status: "center",
    Action: "center",
  };

  // Action Buttons with SweetAlert2 Integration
  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-teal-600 hover:text-teal-800 text-lg" title="View Details" />,
      show: (row) => true,
      onClick: (row) => Swal.fire("View Details", `Batch No: ${row.batchno}`, "info"),
    },
    {
      icon: <FaEdit className="text-blue-600 hover:text-blue-800 text-lg ml-3" title="Edit Batch" />,
      show: (row) => true,
      onClick: (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
      },
    },
    {
      icon: <FaTrash className="text-red-600 hover:text-red-800 text-lg ml-3" title="Delete Batch" />,
      show: (row) => true,
      onClick: (row) => {
        Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete batch ${row.batchno}!`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            setTableData(tableData.filter(item => item.id !== row.id));
            Swal.fire(
              "Deleted!",
              "The batch has been deleted successfully.",
              "success",
            );
          }
        });
      },
    },
  ];

  const headerConfig = {
    title: "Production Batches",
    searchPlaceholder: "Search by Batch No or Product...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddBatch = (e) => {
    e.preventDefault();

    const newBatch = {
      id: Date.now(),
      batchno: e.target.batchno.value,
      productname: e.target.productname.options[e.target.productname.selectedIndex].text,
      quantity: e.target.quantity.value,
      proddate: e.target.proddate.value,
      status: e.target.status.value,
    };

    setTableData([newBatch, ...tableData]);
    setIsModalOpen(false);

    Swal.fire({
      icon: "success",
      title: "Batch Created!",
      text: "New production batch has been added successfully.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleEditBatch = (e) => {
    e.preventDefault();

    const updatedData = tableData.map((item) => {
      if (item.id === selectedRow.id) {
        return {
          ...item,
          quantity: e.target.editQuantity.value,
          status: e.target.editStatus.value,
        };
      }
      return item;
    });

    setTableData(updatedData);
    setIsEditModalOpen(false);

    Swal.fire({
      icon: "success",
      title: "Updated",
      text: "Batch updated successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaIndustry className="text-teal-600" /> Batch Production
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track daily seed manufacturing batches.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FaPlus /> Create New Batch
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        tableHead={tableHead}
        tableData={tableData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        actionButtonsConfig={actionButtonsConfig}
        headerConfig={headerConfig}
        loading={false}
      />

      {/* Create Batch Modal */}
      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        header="Create Production Batch"
      >
        <form onSubmit={handleAddBatch} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                name="batchno"
                required
                placeholder="e.g., BCH-004"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <select
                name="productname"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Choose Product --</option>
                <option value="1">Circle Rice - BR28</option>
                <option value="2">Circle Tomato - Red King</option>
                <option value="3">Circle Potato - Diamond</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Quantity (KG/Pcs)
              </label>
              <input
                type="number"
                name="quantity"
                required
                placeholder="e.g., 5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Production Date
              </label>
              <input
                type="date"
                name="proddate"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
            >
              Create Batch
            </button>
          </div>
        </form>
      </CustomModal>

      {/* Edit Batch Modal */}
      <CustomModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        header="Edit Batch"
      >
        {selectedRow && (
          <form onSubmit={handleEditBatch} className="space-y-4 mt-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p><strong>Batch No:</strong> {selectedRow.batchno}</p>
              <p><strong>Product:</strong> {selectedRow.productname}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Quantity (KG/Pcs)
              </label>
              <input
                type="number"
                name="editQuantity"
                defaultValue={selectedRow.quantity}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select name="editStatus" defaultValue={selectedRow.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </CustomModal>
    </div>
  );
};

export default BatchProduction;
