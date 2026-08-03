import { useState, useMemo, useEffect } from "react";
import CustomModal from "../../../components/CustomModal";

const EmployeeSelectionModal = ({ open, setOpen, employees, selectedIds, onConfirm }) => {
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setTempSelected(selectedIds || []);
      setSearch("");
    }
  }, [open, selectedIds]);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    return employees.filter((emp) => {
      const query = search.toLowerCase();
      return (
        emp.fullName?.toLowerCase().includes(query) ||
        emp.employeeId?.toLowerCase().includes(query)
      );
    });
  }, [employees, search]);

  const handleToggle = (id) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => tempSelected.includes(emp.id));

  const handleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered
      const filteredIds = filteredEmployees.map((e) => e.id);
      setTempSelected((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      const newSelections = filteredEmployees
        .map((e) => e.id)
        .filter((id) => !tempSelected.includes(id));
      setTempSelected((prev) => [...prev, ...newSelections]);
    }
  };

  const handleConfirm = () => {
    onConfirm(tempSelected);
    setOpen(false);
  };

  return (
    <CustomModal
      open={open}
      setOpen={() => setOpen(false)}
      header="Select Employees"
      width="w-[40vw]"
    >
      <div className="flex flex-col h-[50vh]">
        <input
          type="text"
          placeholder="Search employees by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 mb-3 focus:border-primary-500 focus:ring-primary-500 text-sm"
        />
        <div className="flex items-center mb-3 pb-3 border-b border-gray-200">
          <input
            type="checkbox"
            id="selectAll"
            checked={isAllFilteredSelected}
            onChange={handleSelectAll}
            className="mr-2 rounded text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="selectAll"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Select All
          </label>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`emp-${emp.id}`}
                  checked={tempSelected.includes(emp.id)}
                  onChange={() => handleToggle(emp.id)}
                  className="mr-2 rounded text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor={`emp-${emp.id}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {emp.fullName || `Employee ${emp.id}`} - {emp.employeeId || "N/A"} ({emp.role?.value || "N/A"})
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No employees found.</p>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t pt-4 mt-4">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover"
          >
            Done
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default EmployeeSelectionModal;
