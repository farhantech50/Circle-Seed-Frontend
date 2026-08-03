import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import PageLoader from "../components/PageLoader";

export default function Layout() {
  // const { isLoggedIn } = useAuthStore();
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="relative flex w-full h-screen overflow-hidden">
      <Sidebar />

      <main className="flex flex-col flex-grow h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="h-20">
          <Navbar />
        </div>

        <div className="flex-grow p-2">
          <PageLoader>
            <Outlet />
          </PageLoader>
        </div>

        <footer className="flex justify-end text-center p-2">
          <Footer />
        </footer>
      </main>
    </div>
  );
}
