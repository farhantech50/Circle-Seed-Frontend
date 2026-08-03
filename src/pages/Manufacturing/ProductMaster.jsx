import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaPlus, FaSeedling } from "react-icons/fa6";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const ProductMaster = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // আপনার DataTable যে paginationStore ব্যবহার করে, সেখান থেকে totalData সেট করার ফাংশন আনা হলো
  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      sku: "CS-PAD-001",
      name: "Circle Rice - BR28",
      category: "Paddy",
      packsize: "10 KG",
      tradeprice: "750 BDT",
    },
    {
      id: 2,
      sku: "CS-TOM-002",
      name: "Circle Tomato - Red King",
      category: "Vegetable",
      packsize: "500 GM",
      tradeprice: "320 BDT",
    },
    {
      id: 3,
      sku: "CS-POT-003",
      name: "Circle Potato - Diamond",
      category: "Potato",
      packsize: "20 KG",
      tradeprice: "1100 BDT",
    },
  ]);

  // ১. tableHead: আপনার টেবিলের হেডারে যে লেখাগুলো দেখাবে
  const tableHead = [
    "SL",
    "SKU / Code",
    "Product Name",
    "Category",
    "Pack Size",
    "Trade Price",
    "Action",
  ];

  // ২. columnMapping: হেডারের লেখার সাথে অবজেক্টের কী (Key) এর ম্যাপিং
  // যদি ম্যাপিং না দেন তবে টেবিল অটোমেটিক lowercase ও স্পেস রিমুভ করে খুঁজবে (যেমন: "Product Name" হয়ে যাবে "productname")
  const columnMapping = {
    "SKU / Code": "sku",
    "Product Name": "name",
    Category: "category",
    "Pack Size": "packsize",
    "Trade Price": "tradeprice",
  };

  // ৩. columnAlignment: টেক্সট কোন দিকে এলাইন হবে (অপশনাল)
  const columnAlignment = {
    SL: "center",
    "SKU / Code": "left",
    "Trade Price": "right",
    Action: "center",
  };

  // ৪. actionButtonsConfig: অ্যাকশন কলামের বাটনসমূহ (এডিট/ডিলিট আইকন)
  const actionButtonsConfig = [
    {
      icon: <FaEye className="text-teal-600 hover:text-teal-800 text-lg" title="View Details" />,
      show: (row) => true,
      onClick: (row) => Swal.fire("View Details", `SKU: ${row.sku} - Product: ${row.name}`, "info"),
    },
    {
      icon: <FaEdit className="text-blue-600 hover:text-blue-800 text-lg ml-3" title="Edit Product" />,
      show: (row) => true,
      onClick: (row) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
      },
    },
    {
      icon: <FaTrash className="text-red-600 hover:text-red-800 text-lg ml-3" title="Delete Product" />,
      show: (row) => true,
      onClick: (row) => {
        Swal.fire({
          title: "Delete Product?",
          text: `Are you sure you want to delete ${row.name}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes, delete!",
        }).then((res) => {
          if (res.isConfirmed) {
            setTableData(tableData.filter(item => item.id !== row.id));
            Swal.fire("Deleted!", "Product has been removed.", "success");
          }
        });
      },
    },
  ];

  // ৫. headerConfig: টেবিলের ভেতরের টাইটেল ও সার্চবক্সের কনফিগারেশন
  const headerConfig = {
    title: "Seed Products List",
    searchPlaceholder: "Search seeds by name or SKU...",
  };

  // ডাটাবেজে মোট কয়টি ডাটা আছে তা পেজিনেশন স্টোরকে জানানো (যেন Showing 1 to 3 of 3 দেখায়)
  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAddProduct = (e) => {
    e.preventDefault();

    const newProduct = {
      id: Date.now(),
      name: e.target.name.value,
      category: e.target.category.value,
      packsize: e.target.packsize.value,
      sku: e.target.sku.value,
      tradeprice: `${e.target.tradeprice.value} BDT`,
    };

    setTableData([newProduct, ...tableData]);
    setIsModalOpen(false);
    Swal.fire({ icon: "success", title: "Added", text: "Product added successfully", timer: 1500, showConfirmButton: false });
  };

  const handleEditProduct = (e) => {
    e.preventDefault();

    const updatedData = tableData.map(item => {
      if (item.id === selectedRow.id) {
        return {
          ...item,
          tradeprice: `${e.target.editTradeprice.value} BDT`,
          packsize: e.target.editPacksize.value,
        };
      }
      return item;
    });

    setTableData(updatedData);
    setIsEditModalOpen(false);
    Swal.fire({ icon: "success", title: "Updated", text: "Product updated successfully", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="p-6">
      {/* টপ হেডার বাটনসহ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaSeedling className="text-teal-600" /> Product Master
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure company seed variants, SKU codes, and packet sizes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FaPlus /> Add Seed Product
        </button>
      </div>

      {/* আপডেট করা ডাটা টেবিল কম্পোনেন্ট */}
      <DataTable
        tableHead={tableHead}
        tableData={tableData}
        columnMapping={columnMapping}
        columnAlignment={columnAlignment}
        actionButtonsConfig={actionButtonsConfig}
        headerConfig={headerConfig}
        loading={false}
      />

      {/* নতুন প্রোডাক্ট এন্ট্রি করার মডাল ফর্ম */}
      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        header="Register New Seed Product"
      >
        <form onSubmit={handleAddProduct} className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Circle Rice - Minikit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>Paddy</option>
                <option>Vegetable</option>
                <option>Potato</option>
                <option>Jute</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pack Size
              </label>
              <input
                type="text"
                name="packsize"
                required
                placeholder="e.g., 10 KG, 500 GM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product SKU/Code
              </label>
              <input
                type="text"
                name="sku"
                required
                placeholder="e.g., CS-PAD-004"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trade Price (BDT)
              </label>
              <input
                type="number"
                name="tradeprice"
                required
                placeholder="e.g., 750"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
              Save to Master
            </button>
          </div>
        </form>
      </CustomModal>

      {/* Edit Product Modal */}
      <CustomModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        header="Edit Product Details"
      >
        {selectedRow && (
          <form onSubmit={handleEditProduct} className="space-y-4 mt-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p><strong>SKU:</strong> {selectedRow.sku}</p>
              <p><strong>Product:</strong> {selectedRow.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pack Size
              </label>
              <input
                type="text"
                name="editPacksize"
                defaultValue={selectedRow.packsize}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trade Price (BDT)
              </label>
              <input
                type="number"
                name="editTradeprice"
                defaultValue={parseFloat(selectedRow.tradeprice)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
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

export default ProductMaster;
