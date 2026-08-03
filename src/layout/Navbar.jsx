import { useEffect, useRef, useState } from "react";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { FiChevronRight, FiLogOut, FiUser } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { MdSunny } from "react-icons/md";
import { RiLockPasswordFill, RiLockPasswordLine } from "react-icons/ri";
import { useTheme } from "../context/ThemeContext";
import useLogout from "../hooks/useLogout";
import ProfileModal from "../pages/HR/Employees/ProfileModal";
import ChangePasswordModal from "../pages/auth/ChangePasswordModal";
import { useAuthStore } from "../store/authStore";

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { authUser } = useAuthStore();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { logout } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="
        w-full h-16
        bg-navbar-bg dark:bg-navbar-bg-dark
        text-navbar-text dark:text-navbar-text-dark
        border-b border-navbar-border dark:border-navbar-border-dark
        shadow-sm
        flex items-center justify-end px-6 gap-4
      "
    >
      <button
        onClick={toggleTheme}
        className="
          p-2 rounded-full
          hover:bg-navbar-hover dark:hover:bg-navbar-hover-dark
          transition-colors
        "
      >
        {isDark ? (
          <MdSunny className="text-yellow-400 text-xl" />
        ) : (
          <BsFillMoonStarsFill className="text-navbar-text dark:text-navbar-text-dark text-lg" />
        )}
      </button>

      <div ref={menuRef} className="relative">
        <div
          onClick={() => setMenuOpen((prev) => !prev)}
          className="
            flex items-center gap-2 px-2 py-1 rounded-xl
            border border-navbar-border dark:border-navbar-border-dark
            bg-navbar-bg dark:bg-navbar-bg-dark
            hover:bg-navbar-hover dark:hover:bg-navbar-hover-dark
            cursor-pointer
            transition-all duration-200 shadow-sm
          "
        >
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {authUser?.fullName?.charAt(0).toUpperCase()}
          </div>

          <div className="hidden sm:flex flex-col justify-center leading-none overflow-hidden">
            <span className="text-[10px] text-primary font-medium truncate">
              {authUser?.employeeId}
            </span>

            <span className="text-sm font-semibold text-navbar-text dark:text-navbar-text-dark truncate leading-4">
              {authUser?.fullName}
            </span>

            <span className="text-[10px] text-text-light dark:text-gray-400 truncate capitalize leading-4">
              {authUser?.roleName}
            </span>
          </div>

          <HiDotsVertical className="text-navbar-text/60 dark:text-navbar-text-dark/60 text-lg" />
        </div>

        <div
          className={`
    absolute right-0 top-full mt-2 w-56 z-50 overflow-hidden rounded-xl
    bg-navbar-bg dark:bg-navbar-bg-dark
    border border-navbar-border dark:border-navbar-border-dark
    shadow-xl backdrop-blur-sm
    py-2 transition-all duration-200 origin-top-right
    ${
      menuOpen
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95 pointer-events-none"
    }
  `}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
            className="
      group flex w-full items-center justify-between px-4 py-3
      text-sm font-medium
      text-navbar-text dark:text-navbar-text-dark
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      transition-all
    "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <FiUser className="text-base" />
              </div>

              <span>My Profile</span>
            </div>

            <FiChevronRight className="text-gray-400 transition group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              setChangePasswordOpen(true);
            }}
            className="
      group flex w-full items-center justify-between px-4 py-3
      text-sm font-medium
      text-navbar-text dark:text-navbar-text-dark
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      transition-all
    "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <RiLockPasswordLine className="text-base" />
              </div>

              <span>Change Password</span>
            </div>

            <FiChevronRight className="text-gray-400 transition group-hover:translate-x-1" />
          </button>

          <div className="my-2 border-t border-navbar-border dark:border-navbar-border-dark" />

          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
            className="
      group flex w-full items-center justify-between px-4 py-3
      text-sm font-medium
      text-red-600 dark:text-red-400
      hover:bg-red-50 dark:hover:bg-red-900/20
      transition-all
    "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <FiLogOut className="text-base" />
              </div>

              <span>Logout</span>
            </div>

            <FiChevronRight className="text-red-400 transition group-hover:translate-x-1" />
          </button>
        </div>
      </div>
      <ChangePasswordModal
        open={changePasswordOpen}
        setOpen={setChangePasswordOpen}
      />
      <ProfileModal open={profileOpen} setOpen={setProfileOpen} />
    </div>
  );
};

export default Navbar;
