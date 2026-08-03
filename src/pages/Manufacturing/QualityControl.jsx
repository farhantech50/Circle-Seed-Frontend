import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import {
  FaPlus,
  FaVial,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";

const QualityControl = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      batchno: "BCH-001",
      product: "Circle Rice - BR28",
      testedby: "Rahim (QC)",
      result: "Passed",
      date: "2026-06-10",
    },
    {
      id: 2,
      batchno: "BCH-002",
      product: "Circle Tomato - Red King",
      testedby: "Karim (QC)",
      result: "Failed",
      date: "2026-06-12",
    },
    {
      id: 3,
      batchno: "BCH-003",
      product: "Circle Potato - Diamond",
      testedby: "Pending",
      result: "Pending",
      date: "-",
    },
  ]);

  const tableHead = [
    "SL",
    "Batch No",
    "Product",
    "Tested By",
    "Date",
    "Result",
    "Action",
  ];

  const columnMapping = {
    "Batch No": "batchno",
    Product: "product",
    "Tested By": "testedby",
    Date: "date",
    Result: "result",
  };

  const columnAlignment = {
    SL: "center",
    "Batch No": "left",
    Result: "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: (
        <FaEye
          className="text-teal-600 hover:text-teal-800 text-lg"
          title="View Record"
        />
      ),
      show: (row) => true,
      onClick: (row) => Swal.fire("View Record", `Batch No: ${row.batchno}`, "info"),
    },
    {
      icon: (
        <FaCheckCircle
          className="text-green-600 hover:text-green-800 text-lg ml-3"
          title="Approve QC"
        />
      ),
      show: (row) => row.result === "Pending",
      onClick: (row) => {
        setTableData(tableData.map(item => item.id === row.id ? { ...item, result: "Passed" } : item));
        Swal.fire("Approved!", `QC for ${row.batchno} approved.`, "success");
      },
    },
    {
      icon: (
        <FaEdit
          className="text-blue-600 hover:text-blue-800 text-lg ml-3"
          title="Edit Record"
        />
      ),
      show: (row) => true,
      onClick: (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
      },
    },
    {
      icon: (
        <FaTrash
          className="text-red-600 hover:text-red-800 text-lg ml-3"
          title="Delete Record"
        />
      ),
      show: (row) => true,
      onClick: (row) => {
        Swal.fire({
          title: "Are you sure?",
          text: "Delete this QC record?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes, delete!",
        }).then((res) => {
          if (res.isConfirmed) {
            setTableData(tableData.filter(item => item.id !== row.id));
            Swal.fire("Deleted!", "", "success");
          }
        });
      },
    },
  ];

  const headerConfig = {
    title: "Quality Control (QC)",
    searchPlaceholder: "Search batch...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddQC = (e) => {
    e.preventDefault();
    const newQC = {
      id: Date.now(),
      batchno: e.target.batchno.value,
      product: "Unknown Product",
      testedby: e.target.testedby.value,
      result: e.target.result.value,
      date: new Date().toISOString().split('T')[0],
    };
    setTableData([newQC, ...tableData]);
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "QC Record Added",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleEditQC = (e) => {
    e.preventDefault();
    const updatedData = tableData.map(item => {
      if (item.id === selectedRow.id) {
        return {
          ...item,
          testedby: e.target.editTestedby.value,
          result: e.target.editResult.value,
        };
      }
      return item;
    });
    setTableData(updatedData);
    setIsEditModalOpen(false);
    Swal.fire({ icon: "success", title: "Updated", text: "QC Record updated", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="p-3 md:p-4">
      {/* Tight Header */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaVial className="text-teal-600" /> QC Management
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          <FaPlus /> New QC
        </button>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={tableData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        actionButtonsConfig={actionButtonsConfig}
        headerConfig={headerConfig}
      />

      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        header="Add QC Record"
      >
        <form onSubmit={handleAddQC} className="space-y-3 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Batch
              </label>
              <select
                name="batchno"
                required
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-teal-500"
              >
                <option>BCH-001</option>
                <option>BCH-002</option>
                <option>BCH-003</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tested By
              </label>
              <input
                type="text"
                name="testedby"
                required
                placeholder="QC Officer Name"
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              QC Result
            </label>
            <select
              name="result"
              required
              className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-teal-500"
            >
              <option value="Passed">Passed - Ready for Inventory</option>
              <option value="Failed">Failed - Reject Batch</option>
              <option value="Pending">Pending - In Review</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded"
            >
              Save Record
            </button>
          </div>
        </form>
      </CustomModal>

      <CustomModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        header="Edit QC Record"
      >
        {selectedRow && (
          <form onSubmit={handleEditQC} className="space-y-3 mt-1">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p><strong>Batch No:</strong> {selectedRow.batchno}</p>
              <p><strong>Product:</strong> {selectedRow.product}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tested By
              </label>
              <input
                type="text"
                name="editTestedby"
                defaultValue={selectedRow.testedby}
                required
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                QC Result
              </label>
              <select
                name="editResult"
                defaultValue={selectedRow.result}
                required
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-teal-500"
              >
                <option value="Passed">Passed - Ready for Inventory</option>
                <option value="Failed">Failed - Reject Batch</option>
                <option value="Pending">Pending - In Review</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded"
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

export default QualityControl;
