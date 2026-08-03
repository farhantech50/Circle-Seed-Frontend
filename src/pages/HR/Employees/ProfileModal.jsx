import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaUser,
  FaIdBadge,
  FaEnvelope,
  FaPhone,
  FaAddressCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShieldAlt,
} from "react-icons/fa";
import CustomModal from "../../../components/CustomModal";
import useEmployee from "../../../hooks/useEmployee";
import { useAuthStore } from "../../../store/authStore";
import { formatDhakaDate } from "../../../utils/dateUtils";

const ProfileItem = ({ icon, label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-primary-200 hover:bg-primary-50/30">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words font-semibold text-gray-800">
          {value || "-"}
        </p>
      </div>
    </div>
  </div>
);

const ProfileModal = ({ open, setOpen }) => {
  const { authUser } = useAuthStore();
  const { getEmployeeById, loading } = useEmployee();

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!open || !authUser?.id) return;

    const fetchProfile = async () => {
      const res = await getEmployeeById(authUser.id);

      if (res.success) {
        setProfile(res.data);
      }
    };

    fetchProfile();
  }, [open, authUser?.id]);

  const handleClose = () => {
    setOpen(false);
    setProfile(null);
  };

  return (
    <CustomModal
      open={open}
      setOpen={handleClose}
      header=""
      width="w-[95vw] md:w-[800px]"
    >
      {loading || !profile ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-col items-center border-b pb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 shadow">
              <FaUserCircle className="text-7xl text-primary-600" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              {profile.fullName}
            </h2>

            <p className="text-gray-500">
              {profile.role?.value} • {profile.employeeId}
            </p>

            <span
              className={`mt-4 rounded-full px-4 py-1 text-sm font-semibold ${
                profile.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {profile.isActive ? "Active Employee" : "Inactive Employee"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileItem
              icon={<FaUser />}
              label="Username"
              value={profile.username}
            />

            <ProfileItem
              icon={<FaIdBadge />}
              label="Employee ID"
              value={profile.employeeId}
            />

            <ProfileItem
              icon={<FaEnvelope />}
              label="Email Address"
              value={profile.email}
            />

            <ProfileItem
              icon={<FaPhone />}
              label="Contact Number"
              value={profile.contact}
            />

            <ProfileItem
              icon={<FaAddressCard />}
              label="NID Number"
              value={profile.nidNumber}
            />

            <ProfileItem
              icon={<FaShieldAlt />}
              label="Role"
              value={profile.role?.value}
            />

            <ProfileItem
              icon={<FaCalendarAlt />}
              label="Date of Birth"
              value={formatDhakaDate(profile.dateOfBirth)}
            />

            <ProfileItem
              icon={<FaCalendarAlt />}
              label="Joining Date"
              value={formatDhakaDate(profile.joiningDate)}
            />

            <div className="md:col-span-2">
              <ProfileItem
                icon={<FaMapMarkerAlt />}
                label="Address"
                value={profile.address}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t pt-6">
            <button
              onClick={handleClose}
              className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </>
      )}
    </CustomModal>
  );
};

export default ProfileModal;
