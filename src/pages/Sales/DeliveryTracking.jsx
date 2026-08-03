import React, { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import CustomModal from "../../components/CustomModal";
import { usePaginationStore } from "../../store/paginationStore";
import { FaTruck, FaMapMarkerAlt, FaMotorcycle, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";

const DeliveryTracking = () => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const { setTotalData } = usePaginationStore();

  const [tableData, setTableData] = useState([
    {
      id: 1,
      orderId: "ORD-0995",
      customer: "Sikder Enterprise",
      address: "Mirpur 10, Dhaka",
      driver: "Unassigned",
      status: "Processing",
    },
    {
      id: 2,
      orderId: "ORD-0990",
      customer: "Green Delta Seeds",
      address: "Savar, Dhaka",
      driver: "Karim (Van)",
      status: "In Transit",
    },
    {
      id: 3,
      orderId: "ORD-0985",
      customer: "Agro Life Ltd",
      address: "Gazipur",
      driver: "Rahim (Truck)",
      status: "Delivered",
    },
  ]);

  const tableHead = ["SL", "Order ID", "Customer", "Delivery Address", "Assigned To", "Status", "Action"];

  const columnMapping = {
    "Order ID": "orderId",
    Customer: "customer",
    "Delivery Address": "address",
    "Assigned To": "driver",
    Status: "status",
  };

  const columnAlignment = {
    SL: "center",
    Status: "center",
    Action: "center",
  };

  const actionButtonsConfig = [
    {
      icon: <FaMapMarkerAlt className="text-blue-600 hover:text-blue-800 text-lg" title="Track Live Location" />,
      show: (row) => row.status === "In Transit",
      onClick: (row) => Swal.fire("Live Tracking", `Tracking Driver: ${row.driver}`, "info"),
    },
    {
      icon: <FaMotorcycle className="text-teal-600 hover:text-teal-800 text-lg ml-2" title="Assign Driver" />,
      show: (row) => row.status === "Processing",
      onClick: (row) => {
        setSelectedRow(row);
        setIsAssignModalOpen(true);
      },
    },
    {
      icon: <FaCheckCircle className="text-green-600 hover:text-green-800 text-lg ml-2" title="Mark Delivered" />,
      show: (row) => row.status === "In Transit",
      onClick: (row) => {
        Swal.fire({
          title: "Confirm Delivery?",
          text: `Mark order ${row.orderId} as Delivered?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#0d9488",
          confirmButtonText: "Yes, Delivered",
        }).then((res) => {
          if (res.isConfirmed) {
            setTableData(tableData.map(item => item.id === row.id ? { ...item, status: "Delivered" } : item));
            Swal.fire("Delivered!", "Order delivery completed.", "success");
          }
        });
      },
    },
  ];

  const headerConfig = {
    title: "Active Deliveries",
    searchPlaceholder: "Search by Order or Address...",
  };

  useEffect(() => {
    setTotalData(tableData.length);
  }, [tableData, setTotalData]);

  const handleAssignDriver = (e) => {
    e.preventDefault();
    const assignedDriver = e.target.driver.options[e.target.driver.selectedIndex].text;
    
    setTableData(tableData.map(item => {
      if (item.id === selectedRow.id) {
        return {
          ...item,
          driver: assignedDriver,
          status: "In Transit"
        };
      }
      return item;
    }));
    
    setIsAssignModalOpen(false);
    Swal.fire("Assigned!", `Driver assigned to order ${selectedRow.orderId}.`, "success");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaTruck className="text-teal-600" /> Delivery Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-1">Assign drivers and monitor active shipments to customers.</p>
        </div>
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

      <CustomModal open={isAssignModalOpen} setOpen={setIsAssignModalOpen} header="Assign Driver">
        {selectedRow && (
          <form onSubmit={handleAssignDriver} className="space-y-4 mt-2">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <p><strong>Order ID:</strong> {selectedRow.orderId}</p>
              <p><strong>Destination:</strong> {selectedRow.address}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver / Vehicle</label>
              <select name="driver" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">-- Choose Available Driver --</option>
                <option value="1">Karim (Van - Dhaka Metro)</option>
                <option value="2">Rahim (Truck - 3 Ton)</option>
                <option value="3">Jalal (Pickup - 1.5 Ton)</option>
                <option value="4">Third-Party Courier (Pathao/RedX)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium">Assign & Dispatch</button>
            </div>
          </form>
        )}
      </CustomModal>
    </div>
  );
};

export default DeliveryTracking;
