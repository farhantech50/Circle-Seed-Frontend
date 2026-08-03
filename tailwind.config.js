const flowbiteReact = require("flowbite-react/plugin/tailwindcss");

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/lib/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
    ".flowbite-react\\class-list.json",
  ],
  theme: {
    extend: {
      colors: {
        // ================= PRIMARY BRAND (EMERALD) =================
        primary: {
          50: "#ecfdf5", // Lightest mint tint
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#065f46", // Deep emerald (replaces #234C6A)
          600: "#044e39", // Darker emerald for hovers
          700: "#064e3b",
          800: "#022c22",
          900: "#021e17",
        },
        table: {
          bg: "#FFFFFF",
          border: "#d1fae5", // Updated to light emerald tint

          header: "#ecfdf5", // Updated to soft emerald tint
          "header-text": "#065f46", // Updated to primary deep emerald

          row: "#FFFFFF",
          "row-hover": "#f0fdf4", // Very subtle green-tinted hover

          text: "#1F2937",
          muted: "#6B7280",

          search: "#FFFFFF",
          pagination: "#FFFFFF",
        },

        card: {
          bg: "#FFFFFF",
          border: "#d1fae5", // Updated to light emerald tint
        },

        input: {
          bg: "#FFFFFF",
          border: "#D1D5DB",
          text: "#1F2937",
          placeholder: "#9CA3AF",
          focus: "#065f46", // Updated to primary deep emerald
        },

        // ================= TEXT =================
        text: {
          DEFAULT: "#1F2937",
          light: "#6B7280",
          muted: "#9CA3AF",
          dark: "#F9FAFB",
          "dark-light": "#CBD5E1",
        },

        // ================= STATUS =================
        success: "#10B981", // Shifted slightly towards standard Tailwind emerald/green
        "success-hover": "#047857",
        "success-dark": "#34D399",

        warning: "#F59E0B",
        "warning-hover": "#B45309",
        "warning-dark": "#FBBF24",

        danger: "#DC2626",
        "danger-hover": "#B91C1C",
        "danger-dark": "#EF4444",

        info: "#0EA5E9",
        "info-hover": "#0369A1",
        "info-dark": "#38BDF8",

        // ================= BUTTON =================
        button: {
          primary: "#065f46", // Primary Emerald
          "primary-hover": "#044e39", // Hover Emerald
          "primary-dark": "#1E293B",

          secondary: "#E5E7EB",
          "secondary-hover": "#D1D5DB",
          "secondary-dark": "#1F2937",

          light: "#F9FAFB",
          "light-dark": "#0B1220",

          danger: "#DC2626",
          "danger-hover": "#B91C1C",
          "danger-dark": "#EF4444",
        },

        // ================= SIDEBAR (FLAT STYLE) =================
        "sidebar-bg": "#065f46", // Primary Emerald
        "sidebar-text": "#FFFFFF",
        "sidebar-hover": "#0f766e", // Complimentary deep teal/green
        "sidebar-active": "#044e39", // Darker Emerald
        "sidebar-border": "#0f766e",

        "sidebar-bg-dark": "#0F172A",
        "sidebar-text-dark": "#E2E8F0",
        "sidebar-hover-dark": "#1E293B",
        "sidebar-active-dark": "#334155",
        "sidebar-border-dark": "#1E293B",

        // ================= NAVBAR =================
        "navbar-bg": "#FFFFFF",
        "navbar-text": "#1F2937",
        "navbar-border": "#E5E7EB",
        "navbar-hover": "#F3F4F6",

        "navbar-bg-dark": "#0B1220",
        "navbar-text-dark": "#E5E7EB",
        "navbar-border-dark": "#1F2937",
        "navbar-hover-dark": "#111827",
      },
    },
  },
  plugins: [require("flowbite/plugin"), flowbiteReact],
};
