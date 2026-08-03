import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBoxes, FaBoxOpen, FaSeedling } from "react-icons/fa";
import useInventory from "../../hooks/useInventory";
import useLookUp from "../../hooks/useLookup";
import PageLoader from "../../components/PageLoader";
import SearchableSelect from "../../components/SearchableSelect";
import showToast from "../../utils/toast";

const InventoryOverall = () => {
  const { getOverallInventory, loading } = useInventory();
  const { getLookup } = useLookUp();
  const [overallData, setOverallData] = useState([]);
  const [seedTypes, setSeedTypes] = useState([]);
  const [selectedSeedType, setSelectedSeedType] = useState("");

  useEffect(() => {
    fetchSeedTypes();
  }, []);

  useEffect(() => {
    fetchOverallInventory();
  }, [selectedSeedType]);

  const fetchSeedTypes = async () => {
    const res = await getLookup("seed_type");
    if (res.success) {
      setSeedTypes([{ id: "", value: "All Seed Types" }, ...(res.data || [])]);
    }
  };

  const fetchOverallInventory = async () => {
    const filters = selectedSeedType ? { seedTypeId: selectedSeedType } : {};
    const res = await getOverallInventory(filters);
    if (res.success) {
      setOverallData(res.data || []);
    } else {
      showToast(res.message, "error");
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Overview</h2>
        <div className="w-full md:w-64">
          <SearchableSelect
            options={seedTypes}
            value={selectedSeedType}
            onChange={setSelectedSeedType}
            placeholder="Filter by Seed Type"
            getOptionLabel={(option) => option.value}
            getOptionValue={(option) => option.id}
          />
        </div>
      </div>

      {overallData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <FaSeedling className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Inventory Found
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
            There is currently no inventory data available. Stock will appear
            here once goods are received.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {overallData.map((item) => (
            <Link
              to={`/inventory/${item.seedTypeId}`}
              key={item.seedTypeId}
              className="bg-primary-50 rounded-xl shadow-sm border border-primary-100 p-5 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-100 rounded-lg text-primary-700 group-hover:bg-primary-200 transition-colors">
                    <FaSeedling className="w-5 h-5" />
                  </div>
                  <h3
                    className="text-lg font-bold text-gray-800 line-clamp-1"
                    title={item.seedTypeName}
                  >
                    {item.seedTypeName}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white border border-gray-100 shadow-sm p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">
                    Total Stock
                  </span>
                  <span className="text-lg font-bold text-primary-700">
                    {item.totalKg} Kg
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 px-1">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <FaBoxes className="text-gray-400" />
                      Bulk
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.bulkKg} Kg
                    </span>
                  </div>

                  <div className="w-px h-8 bg-gray-200"></div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <FaBoxOpen className="text-gray-400" />
                      Packaged
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {item.packagedKg} Kg
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryOverall;
