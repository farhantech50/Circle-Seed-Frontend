import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { HiOutlineMenu } from "react-icons/hi";
import { useAuthStore } from "../store/authStore";
import menuConfig from "../config/menuConfig";
import { useMediaQuery } from "../utils/useMediaQuery.js";

const Sidebar = () => {
  const location = useLocation();
  const { authUser } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [open, setOpen] = useState(true);
  const [subMenus, setSubMenus] = useState({});

  const toggleSubMenu = (key) => {
    if (!open) setOpen(true);
    setSubMenus((prev) => ({ [key]: !prev[key] }));
  };

  const userRole = authUser?.roleName;

  const filteredMenus = menuConfig
    .filter((menu) => menu.roles.includes(userRole))
    .map((menu) => ({
      ...menu,
      subMenu: menu.subMenu.filter((sub) => sub.roles.includes(userRole)),
    }));
  const isMenuActive = (menu) =>
    location.pathname === menu.path ||
    menu.subMenu?.some((sub) => sub.path === location.pathname);

  useEffect(() => {
    if (isMobile) setOpen(false);
    else setOpen(true);
  }, [isMobile]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
        relative h-screen overflow-y-auto scrollbar-hide
        flex flex-col shrink-0
        transition-all duration-300 ease-in-out

        bg-sidebar-bg dark:bg-sidebar-bg-dark
        text-sidebar-text dark:text-sidebar-text-dark

        ${open ? "w-64 p-5 pt-6" : "w-20 p-3 pt-6"}
      `}
      >
        <div className="flex flex-col gap-4 mb-6 items-center">
          {!open ? (
            <>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="p-2 rounded-md hover:bg-sidebar-hover dark:hover:bg-sidebar-hover-dark transition"
              >
                <HiOutlineMenu className="text-xl text-sidebar-text dark:text-sidebar-text-dark" />
              </button>

              <div className="w-9 h-9 rounded-lg bg-sidebar-text dark:bg-sidebar-text-dark text-sidebar-bg dark:text-sidebar-bg-dark flex items-center justify-center font-bold text-lg">
                CS
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-sidebar-text dark:bg-sidebar-text-dark text-sidebar-bg dark:text-sidebar-bg-dark flex items-center justify-center font-bold text-lg">
                  CS
                </div>

                <span className="text-sidebar-text dark:text-sidebar-text-dark font-bold text-xl">
                  Circle Seed
                </span>
              </div>

              <button
                onClick={() => setOpen((prev) => !prev)}
                className="p-2 rounded-md hover:bg-sidebar-hover dark:hover:bg-sidebar-hover-dark transition"
              >
                <HiOutlineMenu className="text-xl text-sidebar-text dark:text-sidebar-text-dark" />
              </button>
            </div>
          )}
        </div>

        <ul className="flex flex-col gap-1 flex-grow">
          {filteredMenus.map((menu) => {
            const active = isMenuActive(menu);
            const hasSubMenu = menu.subMenu?.length > 0;

            return (
              <li key={menu.key} className="flex flex-col">
                <Link
                  to={hasSubMenu ? "#" : menu.path}
                  onClick={() => hasSubMenu && toggleSubMenu(menu.key)}
                  className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 cursor-pointer

                  text-sidebar-text dark:text-sidebar-text-dark
                  hover:bg-sidebar-hover dark:hover:bg-sidebar-hover-dark

                  ${active ? "bg-sidebar-active dark:bg-sidebar-active-dark" : ""}
                  ${open ? "justify-between" : "justify-center"}
                `}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sidebar-text dark:bg-sidebar-text-dark opacity-80" />
                  )}

                  <div className="flex items-center gap-3">
                    {menu.icon && (
                      <menu.icon className="text-xl shrink-0 text-sidebar-text dark:text-sidebar-text-dark" />
                    )}

                    {open && (
                      <span className="text-sm font-medium">{menu.title}</span>
                    )}
                  </div>

                  {hasSubMenu && open && (
                    <span className="text-xs text-sidebar-text dark:text-sidebar-text-dark">
                      {subMenus[menu.key] ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </span>
                  )}
                </Link>

                {hasSubMenu && subMenus[menu.key] && (
                  <ul className="pl-4 mt-1 flex flex-col gap-0.5">
                    {menu.subMenu.map((sub, i) => (
                      <Link to={sub.path} key={i}>
                        <li
                          className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                          transition-all duration-200 cursor-pointer

                          text-sidebar-text dark:text-sidebar-text-dark
                          hover:bg-sidebar-hover dark:hover:bg-sidebar-hover-dark

                          ${
                            location.pathname === sub.path
                              ? "bg-sidebar-active dark:bg-sidebar-active-dark"
                              : ""
                          }
                        `}
                        >
                          <FaChevronRight className="text-xs shrink-0" />
                          {open && <span>{sub.title}</span>}
                        </li>
                      </Link>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
