import { useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaCheck, FaTimes, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import CustomModal from "../../../../components/CustomModal";
import useLookUp from "../../../../hooks/useLookup";
import { useTriggerRefreshStore } from "../../../../store/triggerRefreshStore";

const CategoryValuesModal = ({ open, setOpen, categoryData }) => {
  const { createLookup, updateLookup, loading } = useLookUp();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  // For creating a brand new category
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryValue, setNewCategoryValue] = useState("");

  // For adding a value to an existing category
  const [newValue, setNewValue] = useState("");

  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateNewLookup = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryValue.trim()) return;

    const result = await Swal.fire({
      title: "Create New Lookup?",
      text: "Are you sure you want to create this new category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Create",
    });

    if (!result.isConfirmed) return;

    const res = await createLookup({
      name: newCategoryName.trim(),
      value: newCategoryValue.trim(),
    });

    if (res.success) {
      setTriggerRefresh();
      handleClose();
      Swal.fire({ title: "Success!", text: res.message, icon: "success", timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire("Error!", res.message, "error");
    }
  };

  const handleAddValue = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const result = await Swal.fire({
      title: "Add New Value?",
      text: `Are you sure you want to add '${newValue}' to '${categoryData.name}'?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Add",
    });

    if (!result.isConfirmed) return;

    const res = await createLookup({
      name: categoryData.name,
      value: newValue.trim(),
    });

    if (res.success) {
      setTriggerRefresh();
      handleClose();
      Swal.fire({ title: "Success!", text: res.message, icon: "success", timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire("Error!", res.message, "error");
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditValue(item.value);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async (item) => {
    if (editValue.trim() === item.value || !editValue.trim()) {
      handleCancelEdit();
      return;
    }

    const res = await updateLookup(item.id, {
      value: editValue.trim(),
      isActive: item.isActive,
    });

    if (res.success) {
      setTriggerRefresh();
      handleClose();
      Swal.fire({ title: "Updated!", text: res.message, icon: "success", timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire("Error!", res.message, "error");
    }
  };

  const handleToggleActive = async (item) => {
    const res = await updateLookup(item.id, {
      value: item.value,
      isActive: !item.isActive,
    });

    if (res.success) {
      setTriggerRefresh();
      // update local state visually if you don't want to close, but parent fetch will handle it soon
      // For now, let's close it so the user sees the update clearly, or keep it open and let it refresh.
      // We will close it so the parent state can update cleanly. 
      // Wait, actually I can just triggerRefresh without closing.
      setTriggerRefresh();
      Swal.fire({ title: "Status Updated!", text: res.message, icon: "success", timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire("Error!", res.message, "error");
    }
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={categoryData ? `Values for: ${categoryData.name}` : "Create New Lookup"}
      width="w-[90vw] md:w-[40vw] lg:w-[30vw]"
    >
      <div className="p-1">
        {categoryData ? (
          <div className="flex flex-col h-[50vh] max-h-[500px]">
            {/* List of existing values */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {categoryData.values.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded-lg border border-primary-500 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(item)} className="text-white bg-green-500 hover:bg-green-600 rounded p-1.5 transition">
                        <FaCheck size={14} />
                      </button>
                      <button onClick={handleCancelEdit} className="text-white bg-gray-400 hover:bg-gray-500 rounded p-1.5 transition">
                        <FaTimes size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`font-medium ${item.isActive ? "text-gray-700" : "text-gray-400 line-through"}`}>
                        {item.value}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleActive(item)} 
                          className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                            item.isActive 
                              ? "bg-green-50 text-green-600 hover:bg-green-100" 
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title={item.isActive ? "Make Inactive" : "Make Active"}
                        >
                          {item.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                        </button>
                        <button 
                          onClick={() => handleStartEdit(item)} 
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Form to add a new value to this category */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <form onSubmit={handleAddValue} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new value..."
                  required
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-button-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-button-primary-hover disabled:opacity-50 whitespace-nowrap"
                >
                  <MdAdd className="h-5 w-5" />
                  Add Value
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateNewLookup} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  placeholder="e.g. leaveStatus"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Use camelCase (no spaces) for the category name.
                </p>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                  Initial Value
                </label>
                <input
                  type="text"
                  value={newCategoryValue}
                  onChange={(e) => setNewCategoryValue(e.target.value)}
                  required
                  placeholder="e.g. pending"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  You can add more values later by clicking on the created category card.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-button-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-button-primary-hover transition shadow-sm disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Lookup"}
              </button>
            </div>
          </form>
        )}
      </div>
    </CustomModal>
  );
};

export default CategoryValuesModal;
