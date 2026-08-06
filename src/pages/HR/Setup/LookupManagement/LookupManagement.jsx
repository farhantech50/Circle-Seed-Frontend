import { useEffect, useState, useMemo } from "react";
import { MdAddCircle } from "react-icons/md";
import { FaListAlt } from "react-icons/fa";
import useLookUp from "../../../../hooks/useLookup";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";
import { usePaginationStore } from "../../../../store/paginationStore";
import { useAuthStore } from "../../../../store/authStore";
import showToast from "../../../../utils/toast";
import CategoryValuesModal from "./CategoryValuesModal";
import PageLoader from "../../../../components/PageLoader";

const LookupManagement = () => {
  const { getLookups, loading } = useLookUp();
  const { authUser } = useAuthStore();
  const { triggerRefresh, setTriggerRefresh } = useTriggerRefreshStore();
  const { search, setSearch } = usePaginationStore();

  const [lookups, setLookups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchInput, setSearchInput] = useState(search || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, setSearch]);

  useEffect(() => {
    fetchLookups();
  }, [triggerRefresh, search]);

  const fetchLookups = async () => {
    const res = await getLookups({ limit: 1000 }); // fetch all to group them

    if (res.success) {
      setLookups(res.data || []);
    } else {
      setLookups([]);
      showToast(res.message, "error");
    }
  };

  const groupedLookups = useMemo(() => {
    return lookups.reduce((acc, lookup) => {
      if (!acc[lookup.name]) {
        acc[lookup.name] = [];
      }
      acc[lookup.name].push(lookup);
      return acc;
    }, {});
  }, [lookups]);

  const handleCreateNewLookup = () => {
    setSelectedCategory(null);
    setOpenModal(true);
  };

  const handleCardClick = (categoryName, values) => {
    setSelectedCategory({ name: categoryName, values });
    setOpenModal(true);
  };

  if (loading && lookups.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lookup Management</h1>
          <p className="text-gray-500 mt-1">Manage system categories and their values</p>
        </div>
        
        {(authUser?.permissions?.includes("SUPER") ||
          authUser?.permissions?.includes("CREATE_LOOKUP")) && (
          <button
            onClick={handleCreateNewLookup}
            className="inline-flex items-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-button-primary-hover"
          >
            <MdAddCircle className="h-5 w-5" />
            Create New Lookup
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search categories..."
          className="w-full sm:w-1/3 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {Object.entries(groupedLookups).map(([categoryName, values]) => (
          <div
            key={categoryName}
            onClick={() => handleCardClick(categoryName, values)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white mb-5 shadow-sm">
                <FaListAlt className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 break-all leading-tight">{categoryName}</h2>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mt-6 border-t pt-4">
              <span className="font-medium">Total Values</span>
              <span className="font-bold px-3 py-1 rounded-full bg-primary-100 text-primary-700">
                {values.length}
              </span>
            </div>
          </div>
        ))}
        
        {Object.keys(groupedLookups).length === 0 && !loading && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
            <FaListAlt className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No lookups found</h3>
            <p className="text-gray-500 mt-1 max-w-sm text-center">Create a new lookup category to get started and manage your system dropdowns.</p>
          </div>
        )}
      </div>

      {openModal && (
        <CategoryValuesModal
          open={openModal}
          setOpen={setOpenModal}
          categoryData={selectedCategory}
        />
      )}
    </div>
  );
};

export default LookupManagement;
