import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUmbrellaBeach,
  FaCalendarWeek,
  FaMoneyCheckAlt,
  FaMapMarkerAlt,
  FaClipboardList,
  FaStore,
  FaChartLine,
  FaBullhorn,
  FaListAlt,
} from "react-icons/fa";

const Setup = () => {
  const navigate = useNavigate();

  const setupItems = [
    {
      title: "Holiday Configuration",
      description:
        "Create and manage public holidays, company holidays, and special leave days.",
      icon: <FaUmbrellaBeach className="w-10 h-10" />,
      route: "/hr/setup/holiday",
    },
    {
      title: "Weekend Configuration",
      description:
        "Configure weekly holidays and define the organization's working week.",
      icon: <FaCalendarWeek className="w-10 h-10" />,
      route: "/hr/setup/weekend",
    },
    {
      title: "Salary Configuration",
      description:
        "Configure salary components, payroll settings, and organization-wide salary policies.",
      icon: <FaMoneyCheckAlt className="w-10 h-10" />,
      route: "/hr/setup/salary",
    },
    {
      title: "Attendance Location",
      description:
        "Manage office locations, geofencing radii, and authorized IP addresses for employee clock-ins.",
      icon: <FaMapMarkerAlt className="w-10 h-10" />,
      route: "/hr/setup/attendance-location",
    },
    {
      title: "Leave Quota Configuration",
      description:
        "Manage yearly leave quotas and balances for employees.",
      icon: <FaClipboardList className="w-10 h-10" />,
      route: "/hr/setup/leave-quota",
    },
    {
      title: "POS Location Configuration",
      description:
        "Manage POS locations, active outlet status, and employee counter assignments.",
      icon: <FaStore className="w-10 h-10" />,
      route: "/hr/setup/pos-location",
    },
    {
      title: "Sales Target Configuration",
      description:
        "Configure monthly sales targets and amount limits for sales employees.",
      icon: <FaChartLine className="w-10 h-10" />,
      route: "/hr/setup/sales-target",
    },
    {
      title: "Marketing Target Configuration",
      description:
        "Configure monthly lead, visit, and follow-up targets for marketing team.",
      icon: <FaBullhorn className="w-10 h-10" />,
      route: "/hr/setup/marketing-target",
    },
    {
      title: "Lookup Management",
      description:
        "Create and manage system lookups such as leave statuses, tuition statuses, etc.",
      icon: <FaListAlt className="w-10 h-10" />,
      route: "/hr/setup/lookup-management",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">HR Configuration</h1>

        <p className="mt-2 text-text-light">
          Configure holidays, weekly off-days, and salary settings used
          throughout the HR system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {setupItems.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.route)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl"
          >
            <div className="border-b border-primary-100 bg-primary-50 px-6 py-7">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-white transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-primary-700">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-sm text-text-light">
                    HR Configuration
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="leading-7 text-text-light">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Setup;
