import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import usePermission from "../../../hooks/usePermission";
import showToast from "../../../utils/toast";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";

const AddPermissionModal = ({
  open,
  setOpen,
  selectedRoleId,
  setSelectedRoleId,
  selectedRolePermissions,
}) => {
  const { getAllPermissions, setRolePermissions, loading } = usePermission();
  const { setTriggerRefresh } = useTriggerRefreshStore();
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (!open) return;

    const fetchPermissions = async () => {
      const res = await getAllPermissions();

      if (res.success) {
        setPermissions(res.data || []);
      } else {
        setPermissions([]);
        showToast(res.message, "error");
      }
    };

    fetchPermissions();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedPermissions([]);
    }
  }, [open]);

  const availablePermissions = useMemo(() => {
    const assignedIds = new Set(
      (selectedRolePermissions || []).map((p) => p.id),
    );

    return permissions.filter((p) => !assignedIds.has(p.id));
  }, [permissions, selectedRolePermissions]);

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Add Permissions?",
      text: "Assign selected permissions to this role?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Add",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await setRolePermissions({
        role: selectedRoleId,
        permissionIds: selectedPermissions,
      });

      if (res.success) {
        Swal.fire({
          title: "Success!",
          text: res.message,
          icon: "success",
          confirmButtonColor: "#0D9488",
        });
        setTriggerRefresh();
        setOpen(false);
        setSelectedPermissions([]);
      } else {
        Swal.fire({
          title: "Error!",
          text: res.message || "Failed to assign permissions.",
          icon: "error",
          confirmButtonColor: "#0D9488",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPermissions([]);
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header="Add Permissions"
      width="w-[40vw]"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-primary-100 divide-y divide-primary-100">
          {availablePermissions.length > 0 ? (
            availablePermissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-primary-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => togglePermission(permission.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />

                <div>
                  <p className="font-medium text-text">{permission.label}</p>
                </div>
              </label>
            ))
          ) : (
            <div className="py-10 text-center text-gray-500">
              All permissions are already assigned.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || selectedPermissions.length === 0}
            className="rounded-lg bg-button-primary px-5 py-2 text-white transition hover:bg-button-primary-hover disabled:opacity-50"
          >
            Add Selected ({selectedPermissions.length})
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddPermissionModal;
