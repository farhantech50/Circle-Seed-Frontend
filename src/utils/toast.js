import { toast } from "react-toastify";

const baseConfig = {
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

const toastConfig = {
  success: {
    fn: toast.success,
    style: { background: "#50b50d" },
    position: "top-right",
  },
  error: {
    fn: toast.error,
    style: { background: "#de0d0d" },
    position: "top-right",
  },
  warn: {
    fn: toast.warn,
    style: { background: "#ed7718" },
    position: "top-right",
  },
  "success-left": {
    fn: toast.success,
    style: { background: "#50b50d" },
    position: "top-left",
  },
  "error-left": {
    fn: toast.error,
    style: { background: "#de0d0d" },
    position: "top-left",
  },
  "warn-left": {
    fn: toast.warn,
    style: { background: "#ed7718" },
    position: "top-left",
  },
};

const showToast = (message, type = "success") => {
  const config = toastConfig[type];
  if (!config) return;

  config.fn(message, {
    ...baseConfig,
    position: config.position,
    style: config.style,
  });
};

export default showToast;
