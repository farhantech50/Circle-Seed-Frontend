import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import CustomModal from "../../../components/CustomModal";
import Lookup from "../../../components/Lookup";
import useEmployee from "../../../hooks/useEmployee";
import { useTriggerRefreshStore } from "../../../store/triggerRefreshStore";
import showToast from "../../../utils/toast";
import { FaClock, FaExclamationTriangle } from "react-icons/fa";

const initialForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  contact: "",
  address: "",
  roleId: "",
  nidNumber: "",
  dateOfBirth: "",
  joiningDate: "",
  shiftStart: "09:00",
  shiftEnd: "18:00",
  isActive: true,
  locationBoundedAttendance: true,
};

const CreateEmployeeModal = ({
  open,
  setOpen,
  employeeData,
  setEmployeeData,
}) => {
  const { createEmployee, updateEmployee, loading } = useEmployee();
  const { setTriggerRefresh } = useTriggerRefreshStore();

  const [formData, setFormData] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setErrorMessage("");
    setFieldErrors({});

    if (employeeData) {
      setFormData({
        fullName: employeeData.fullName || "",
        username: employeeData.username || "",
        email: employeeData.email || "",
        password: "",
        contact: employeeData.contact || "",
        address: employeeData.address || "",
        roleId: employeeData.role?.id || employeeData.roleId || "",
        nidNumber: employeeData.nidNumber || "",
        dateOfBirth: employeeData.dateOfBirth?.split("T")[0] || "",
        joiningDate: employeeData.joiningDate?.split("T")[0] || "",
        shiftStart: employeeData.shiftStart || "09:00",
        shiftEnd: employeeData.shiftEnd || "18:00",
        isActive: employeeData.isActive ?? true,
        locationBoundedAttendance:
          employeeData.locationBoundedAttendance ?? true,
      });
    } else {
      setFormData(initialForm);
    }
  }, [employeeData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmployeeData(null);
    setFormData(initialForm);
    setErrorMessage("");
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    // Client-side validations
    if (!formData.roleId) {
      setErrorMessage("Please select a role for the employee.");
      setFieldErrors({ roleId: "Role selection is required." });
      showToast("Role selection is required.", "error");
      return;
    }

    if (!employeeData && !formData.password) {
      setErrorMessage("Password is required for creating a new employee.");
      setFieldErrors({ password: "Password is required." });
      showToast("Password is required.", "error");
      return;
    }

    const result = await Swal.fire({
      title: employeeData ? "Update Employee?" : "Create Employee?",
      text: employeeData
        ? "Do you want to update this employee record?"
        : "Do you want to create this new employee account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: employeeData ? "Yes, Update" : "Yes, Create",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const payload = {
      fullName: formData.fullName?.trim(),
      username: formData.username?.trim(),
      email: formData.email?.trim(),
      contact: formData.contact?.trim(),
      address: formData.address?.trim(),
      roleId: formData.roleId ? Number(formData.roleId) : null,
      nidNumber: formData.nidNumber?.trim(),
      dateOfBirth: formData.dateOfBirth || null,
      joiningDate: formData.joiningDate || null,
      shiftStart: formData.shiftStart || "09:00",
      shiftEnd: formData.shiftEnd || "18:00",
      locationBoundedAttendance: formData.locationBoundedAttendance,
    };

    if (!employeeData) {
      payload.password = formData.password;
    } else {
      payload.isActive = formData.isActive;
      if (formData.password) {
        payload.password = formData.password;
      }
    }

    try {
      const res = employeeData
        ? await updateEmployee(employeeData.id, payload)
        : await createEmployee(payload);

      if (res.success) {
        setTriggerRefresh();
        handleClose();

        await Swal.fire({
          title: "Success!",
          text:
            res.message ||
            (employeeData
              ? "Employee updated successfully"
              : "Employee created successfully"),
          icon: "success",
          confirmButtonColor: "#0D9488",
        });
      } else {
        // Keep modal open so user retains typed input and sees exact failure error!
        const msg =
          res.message || "Failed to save employee. Please check inputs.";
        setErrorMessage(msg);

        if (res.errors && typeof res.errors === "object") {
          setFieldErrors(res.errors);
        }

        showToast(msg, "error");
      }
    } catch (error) {
      console.error("Employee submit error:", error);
      const errMsg = error?.message || "An unexpected error occurred.";
      setErrorMessage(errMsg);
      showToast(errMsg, "error");
    }
  };

  const renderFieldError = (fieldName) => {
    const err = fieldErrors[fieldName];
    if (!err) return null;
    return (
      <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
        • {Array.isArray(err) ? err.join(", ") : String(err)}
      </p>
    );
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header={
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary-600" />
          <span>{employeeData ? "Edit Employee" : "Create Employee"}</span>
        </div>
      }
      width={"w-[90vw] md:w-[50vw] max-w-3xl"}
    >
      {/* Prominent UI Error Alert Banner */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 shadow-sm backdrop-blur-xs">
          <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div className="flex-1 text-xs">
            <p className="mb-0.5 font-bold text-sm text-rose-950">
              {employeeData ? "Update Failed" : "Creation Failed"}
            </p>
            <p className="leading-relaxed font-medium text-rose-800">
              {errorMessage}
            </p>
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="mt-2.5 list-disc list-inside space-y-1 text-[11px] font-medium text-rose-700 border-t border-rose-200/60 pt-2">
                {Object.entries(fieldErrors).map(([key, val]) => (
                  <li key={key}>
                    <strong className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </strong>{" "}
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.fullName
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
            />
            {renderFieldError("fullName")}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.username
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. johndoe"
              required
            />
            {renderFieldError("username")}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              required
            />
            {renderFieldError("email")}
          </div>

          {/* Password (Only when creating) */}
          {!employeeData && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.password
                    ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
                }`}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              {renderFieldError("password")}
            </div>
          )}

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Contact Number <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.contact
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g. +8801700000000"
              required
            />
            {renderFieldError("contact")}
          </div>

          {/* NID Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              NID Number <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.nidNumber
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              name="nidNumber"
              value={formData.nidNumber}
              onChange={handleChange}
              placeholder="National ID"
              required
            />
            {renderFieldError("nidNumber")}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.dateOfBirth
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
            {renderFieldError("dateOfBirth")}
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Joining Date <span className="text-rose-500">*</span>
            </label>
            <input
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs focus:outline-none focus:ring-2 ${
                fieldErrors.joiningDate
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
              required
            />
            {renderFieldError("joiningDate")}
          </div>

          {/* Shift Start */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Shift Start <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-300 pl-3.5 pr-10 py-2.5 text-sm cursor-pointer shadow-xs transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="time"
                name="shiftStart"
                value={formData.shiftStart}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <FaClock className="h-4 w-4" />
              </div>
            </div>
            {renderFieldError("shiftStart")}
          </div>

          {/* Shift End */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Shift End <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-300 pl-3.5 pr-10 py-2.5 text-sm cursor-pointer shadow-xs transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                type="time"
                name="shiftEnd"
                value={formData.shiftEnd}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <FaClock className="h-4 w-4" />
              </div>
            </div>
            {renderFieldError("shiftEnd")}
          </div>

          {/* Role & Location Attendance Switch (Placed Side by Side) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Role <span className="text-rose-500">*</span>
            </label>
            <Lookup
              lookupName="role"
              selectedId={formData.roleId}
              setSelectedId={(id) => {
                setFormData((prev) => ({
                  ...prev,
                  roleId: id,
                }));
                if (fieldErrors.roleId) {
                  setFieldErrors((prev) => ({ ...prev, roleId: null }));
                }
                if (errorMessage) setErrorMessage("");
              }}
              isMultiple={false}
            />
            {renderFieldError("roleId")}
          </div>

          {/* Location Bounded Switch Container */}
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5 ">
              Attendance <span className="text-rose-500">*</span>
            </label>
            <div className="flex h-[42px] items-center justify-between rounded-lg border border-gray-300 bg-gray-50/70 px-3.5 shadow-xs transition-all hover:bg-gray-50">
              <span className="text-xs font-medium text-gray-700 truncate pr-2">
                Location Bounded
              </span>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    locationBoundedAttendance: !prev.locationBoundedAttendance,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.locationBoundedAttendance
                    ? "bg-primary-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    formData.locationBoundedAttendance
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status (Edit mode only) */}
          {employeeData && (
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Account Status
              </label>

              <select
                name="isActive"
                value={formData.isActive ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm bg-white shadow-xs focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Address <span className="text-rose-500">*</span>
            </label>

            <textarea
              rows={3}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all shadow-xs resize-none focus:outline-none focus:ring-2 ${
                fieldErrors.address
                  ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
              }`}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter full street address, apartment/suite number..."
              required
            />
            {renderFieldError("address")}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            {loading
              ? "Saving..."
              : employeeData
                ? "Update Employee"
                : "Create Employee"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateEmployeeModal;
