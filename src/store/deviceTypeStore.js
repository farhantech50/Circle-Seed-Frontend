import { create } from "zustand";

const getOS = (ua) => {
  if (/Windows/i.test(ua)) return "windows";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  return "unknown";
};

const getBrowser = (ua) => {
  if (/wv/i.test(ua) && /Android/i.test(ua)) return "android-webview";
  if (/Edg\//i.test(ua)) return "edge";
  if (/OPR\/|Opera/i.test(ua)) return "opera";
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/Chrome/i.test(ua)) return "chrome";
  if (/Safari/i.test(ua)) return "safari";
  if (/Firefox/i.test(ua)) return "firefox";
  if (/MSIE|Trident/i.test(ua)) return "ie";
  return "unknown";
};

const getPlatformType = (osType, browserType) => {
  if (osType === "windows") return "web";

  if (osType === "android") {
    return browserType === "android-webview" ? "app" : "web";
  }

  if (osType === "ios") {
    return browserType === "ios-webview" ? "app" : "web";
  }

  return "web";
};

const getDeviceInfo = () => {
  if (typeof window === "undefined") {
    return {
      osType: "unknown",
      browserType: "unknown",
      platformType: "unknown",
    };
  }

  const ua = navigator.userAgent;

  const osType = getOS(ua);
  const browserType = getBrowser(ua);

  return {
    osType,
    browserType,
    platformType: getPlatformType(osType, browserType),
  };
};

export const deviceTypeStore = create(() => ({
  ...getDeviceInfo(),
}));
