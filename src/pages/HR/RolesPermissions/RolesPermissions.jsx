import { useEffect, useState } from "react";
import { FaPlus, FaShieldAlt, FaUserShield } from "react-icons/fa";
import { LuCircleX } from "react-icons/lu";
import usePermission from "../../../hooks/usePermission";
import showToast from "../../../utils/toast";
import Swal from "sweetalert2";
import AddPermissionModal from "./AddPermissionModal";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";

const RolesPermissions = () => {
  const { getRoles, getPermissionsByRole, deletePermissionForRole, loading } =
    usePermission();
  const { triggerRefresh } = useTriggerRefreshStore();
  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await getRoles();

      if (res.success) {
        setRoles(res.data);

        if (res.data.length > 0) {
          setSelectedRole(res.data[0]);
        }
      } else {
        setRoles([]);
        showToast(res.message, "error");
      }
    };

    fetchRoles();
  }, []);
  useEffect(() => {
    if (!selectedRole) return;

    const fetchPermissionsByRole = async () => {
      const res = await getPermissionsByRole(selectedRole.id);
      if (res.success) {
        setSelectedRolePermissions(res.data || []);
      } else {
        setSelectedRolePermissions([]);
        showToast(res.message, "error");
      }
    };

    fetchPermissionsByRole();
  }, [selectedRole, triggerRefresh]);

  const deleteRolePermission = async (permissionId) => {
    const result = await Swal.fire({
      title: "Remove Permission?",
      text: "This permission will be removed from the selected role.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await deletePermissionForRole(selectedRole.id, permissionId);

      if (res.success) {
        Swal.fire({
          title: "Removed!",
          text: res.message,
          icon: "success",
          confirmButtonColor: "#0D9488",
        });

        const permissionRes = await getPermissionsByRole(selectedRole.id);

        if (permissionRes.success) {
          setSelectedRolePermissions(permissionRes.data);
        } else {
          setSelectedRolePermissions([]);
          showToast(permissionRes.message, "error");
        }
      } else {
        Swal.fire({
          title: "Error!",
          text: res.message || "Failed to remove permission.",
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
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel */}
        <div className="lg:col-span-1 rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="bg-primary-500 px-5 py-4 text-white shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaUserShield />
              Roles
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-primary-100">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center justify-between px-5 py-4 text-left transition ${
                  selectedRole?.id === role.id
                    ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 font-semibold"
                    : "hover:bg-primary-50 text-text"
                }`}
              >
                <span>{role.value}</span>

                {selectedRole?.id === role.id && (
                  <FaShieldAlt className="text-primary-500" />
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Right Panel */}
        <div className="lg:col-span-3 rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-primary-500 px-6 py-4 shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {selectedRole?.value || "Select Role"}
              </h2>

              <p className="text-primary-100 text-sm">Assigned Permissions</p>
            </div>

            <button
              onClick={() => setOpenPermissionModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow transition hover:bg-primary-50"
            >
              <FaPlus />
              Add Permission
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedRolePermissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedRolePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="relative flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await deleteRolePermission(permission.id);

                        if (res.success) {
                          setSelectedRolePermissions((prev) =>
                            prev.filter((p) => p.id !== permission.id),
                          );

                          showToast(res.message, "success");
                        } else {
                          showToast(res.message, "error");
                        }
                      }}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-red-500 transition hover:bg-red-100 hover:text-red-700"
                    >
                      <LuCircleX size={18} />
                    </button>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white">
                      <FaShieldAlt />
                    </div>

                    <span className="font-medium text-text">
                      {permission.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FaShieldAlt className="mb-4 text-5xl text-primary-200" />

                <h3 className="text-lg font-semibold text-text">
                  No Permissions Assigned
                </h3>

                <p className="mt-2 text-text-light">
                  Click the <strong>Add Permission</strong> button to assign
                  permissions to this role.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AddPermissionModal
        open={openPermissionModal}
        setOpen={setOpenPermissionModal}
        selectedRoleId={selectedRole?.id}
        setSelectedRoleId={setSelectedRole}
        selectedRolePermissions={selectedRolePermissions}
      />
    </div>
  );
};

export default RolesPermissions;
