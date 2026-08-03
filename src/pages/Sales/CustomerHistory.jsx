import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaUsers, FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const CustomerHistory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      name: "Rahim Traders",
      phone: "01711223344",
      address: "Dhaka",
      orders: "15",
      spent: "5,40,000",
      status: "Active",
    },
    {
      id: 2,
      name: "Maa Seed Store",
      phone: "01999887766",
      address: "Savar",
      orders: "3",
      spent: "45,000",
      status: "Active",
    },
    {
      id: 3,
      name: "Agro Life Ltd",
      phone: "01811554433",
      address: "Gazipur",
      orders: "1",
      spent: "12,000",
      status: "Inactive",
    },
  ]);

  const tableHead = ["SL", "Customer Name", "Phone", "Region", "Total Orders", "Total Spent", "Status", "Action"];

  const columnMapping = {
    "Customer Name": "name",
    Phone: "phone",
    Region: "address",
    "Total Orders": "orders",
    "Total Spent": "spent",
    Status: "status",
  };

  const columnAlignment = {
    SL: "center",
    "Total Orders": "center",
    "Total Spent": "right",
    Status: "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-teal-600 hover:text-teal-800 text-lg" title="View Profile" />,
      show: (row) => true,
      onClick: (row) => Swal.fire("Customer Profile", `Profile of ${row.name}\nTotal Spent: BDT ${row.spent}`, "info"),
    },
    {
      icon: <FaEdit className="text-blue-600 hover:text-blue-800 text-lg ml-3" title="Edit Customer" />,
      show: (row) => true,
      onClick: (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
      },
    },
    {
      icon: <FaTrash className="text-red-600 hover:text-red-800 text-lg ml-3" title="Delete Customer" />,
      show: (row) => true,
      onClick: (row) => {
        Swal.fire({
          title: "Delete Customer?",
          text: `Remove ${row.name} from records?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes, delete!",
        }).then((res) => {
          if (res.isConfirmed) {
            setTableData(tableData.filter(item => item.id !== row.id));
            Swal.fire("Deleted!", "Customer has been removed.", "success");
          }
        });
      },
    },
  ];

  const headerConfig = {
    title: "Customer Directory",
    searchPlaceholder: "Search by name or phone...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const newCustomer = {
      id: Date.now(),
      name: e.target.name.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      orders: "0",
      spent: "0",
      status: e.target.status.value,
    };
    setTableData([newCustomer, ...tableData]);
    setIsModalOpen(false);
    Swal.fire({ icon: "success", title: "Added", text: "Customer added successfully.", timer: 1500, showConfirmButton: false });
  };

  const handleEditCustomer = (e) => {
    e.preventDefault();
    const updatedData = tableData.map(item => {
      if (item.id === selectedRow.id) {
        return {
          ...item,
          phone: e.target.editPhone.value,
          address: e.target.editAddress.value,
          status: e.target.editStatus.value,
        };
      }
      return item;
    });
    setTableData(updatedData);
    setIsEditModalOpen(false);
    Swal.fire({ icon: "success", title: "Updated", text: "Customer details updated.", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUsers className="text-teal-600" /> Customer History
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage wholesale buyers, distributors, and direct clients.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FaPlus /> Add Customer
        </button>
      </div>

      <DataTable
        tableHead={tableHead}
        tableData={tableData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        actionButtonsConfig={actionButtonsConfig}
        headerConfig={headerConfig}
        loading={false}
      />

      {/* Add Modal */}
      <CustomModal open={isModalOpen} setOpen={setIsModalOpen} header="Register New Customer">
        <form onSubmit={handleAddCustomer} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company / Customer Name</label>
            <input type="text" name="name" required placeholder="e.g., Rahman Traders" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" name="phone" required placeholder="01XXXXXXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region / Address</label>
            <textarea name="address" required placeholder="Full address..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">Register Customer</button>
          </div>
        </form>
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal open={isEditModalOpen} setOpen={setIsEditModalOpen} header="Edit Customer">
        {selectedRow && (
          <form onSubmit={handleEditCustomer} className="space-y-4 mt-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p><strong>Customer:</strong> {selectedRow.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" name="editPhone" defaultValue={selectedRow.phone} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="editStatus" defaultValue={selectedRow.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region / Address</label>
              <textarea name="editAddress" defaultValue={selectedRow.address} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">Save Changes</button>
            </div>
          </form>
        )}
      </CustomModal>
    </div>
  );
};

export default CustomerHistory;
