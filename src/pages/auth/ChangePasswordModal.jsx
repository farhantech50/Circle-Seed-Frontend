import { useState } from "react";
import Swal from "sweetalert2";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import usePasswordReset from "../../hooks/usePasswordReset";
import CustomModal from "../../components/CustomModal";
import { useAuthStore } from "../../store/authStore";
import checkPasswordValidity from "../../utils/passwordValidation";

const ChangePasswordModal = ({ open, setOpen }) => {
  const { changePassword, loading } = usePasswordReset();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPassword({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = checkPasswordValidity(formData.newPassword);

    if (passwordError) {
      await Swal.fire({
        title: "Invalid Password",
        text: passwordError,
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      await Swal.fire({
        title: "Error!",
        text: "New passwords do not match",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Change Password?",
      text: "You will be logged out after changing your password.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0D9488",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Change",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const res = await changePassword(
      formData.currentPassword,
      formData.newPassword,
    );

    if (res.success) {
      handleClose();

      await Swal.fire({
        title: "Success!",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#0D9488",
      });

      useAuthStore.getState().logout();
    } else {
      await Swal.fire({
        title: "Error!",
        text: res.message || "Failed to change password",
        icon: "error",
        confirmButtonColor: "#0D9488",
      });
    }
  };
  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header=""
      width="w-[95vw] sm:w-[500px]"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
          <FaShieldAlt className="text-3xl text-primary-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>

        <p className="mt-2 text-sm text-gray-500">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          label="Current Password"
          name="currentPassword"
          value={formData.currentPassword}
          visible={showPassword.current}
          onToggle={() =>
            setShowPassword((p) => ({
              ...p,
              current: !p.current,
            }))
          }
          onChange={handleChange}
        />

        <PasswordField
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          visible={showPassword.new}
          onToggle={() =>
            setShowPassword((p) => ({
              ...p,
              new: !p.new,
            }))
          }
          onChange={handleChange}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          visible={showPassword.confirm}
          onToggle={() =>
            setShowPassword((p) => ({
              ...p,
              confirm: !p.confirm,
            }))
          }
          onChange={handleChange}
        />

        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-600">
            Password should contain at least:
          </p>

          <ul className="mt-2 space-y-1 text-xs text-gray-500 list-disc ml-5">
            <li>8 or more characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One special character</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
};

const PasswordField = ({ label, name, value, visible, onToggle, onChange }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      {label}
    </label>

    <div className="relative">
      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-12 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  </div>
);

export default ChangePasswordModal;
