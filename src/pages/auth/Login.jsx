import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaLeaf } from "react-icons/fa";
import useLogin from "../../hooks/useLogin";
import showToast from "../../utils/toast";

const Login = () => {
  const { login, loading } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ username, password });

      if (!res.success) {
        showToast(res?.data?.error, "error");
      }
    } catch (err) {
      showToast("Login failed", "error");
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/477756915/photo/seamless-texture-with-spices-and-herbs.jpg?s=612x612&w=0&k=20&c=t9fckmk-oIJvwLgg-wA-DW6830JpAFtUmmVrr-JjmRc=')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-[2px]" />

      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/20 bg-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="hidden w-5/12 flex-col justify-between bg-white/5 p-10 lg:flex">
          <div>
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-xl">
              <FaLeaf className="text-3xl text-white" />
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white">
              CircleSeed ERP
            </h1>

            <p className="mt-6 text-base leading-8 text-white/85">
              Manage Manufacturing, Inventory, Procurement, Sales, HR and
              Accounting from one secure and powerful ERP platform.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
            <h3 className="mb-3 text-lg font-bold text-white">
              Why CircleSeed?
            </h3>

            <ul className="space-y-3 text-sm text-white/80">
              <li>✓ Manufacturing Management</li>
              <li>✓ Inventory Control</li>
              <li>✓ Purchase & Sales</li>
              <li>✓ HR & Payroll</li>
              <li>✓ Accounting & Reporting</li>
            </ul>
          </div>
        </div>

        <div className="w-full bg-white/30 p-8 backdrop-blur-2xl lg:w-7/12 lg:p-12">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-primary-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
              Welcome Back
            </span>

            <h2 className="mt-4 text-4xl font-black text-gray-900">Sign In</h2>

            <p className="mt-2 text-gray-700">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Username
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-12 pr-4 shadow-sm outline-none transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-12 pr-4 shadow-sm outline-none transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary-700 hover:text-primary-800"
              >
                Forgot password?
              </Link>
            </div>{" "}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary-600 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:bg-primary-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0A12 12 0 000 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-700">
                Secure access to your ERP dashboard.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
