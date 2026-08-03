import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import usePasswordReset from "../../hooks/usePasswordReset";
import showToast from "../../utils/toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { resetPassword, loading } = usePasswordReset();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast("Invalid or missing reset token", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const res = await resetPassword(token, newPassword);
    if (res.success) {
      showToast(res.message, "success");
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      showToast(res.message, "error");
    }
  };

  const LayoutWrapper = ({ children }) => (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://media.istockphoto.com/id/477756915/photo/seamless-texture-with-spices-and-herbs.jpg?s=612x612&w=0&k=20&c=t9fckmk-oIJvwLgg-wA-DW6830JpAFtUmmVrr-JjmRc=')" }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 mix-blend-multiply"></div>

      {/* Main Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col lg:flex-row rounded-3xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/20 shadow-2xl">
        
        {/* Left Div - Simple Text Info */}
        <div className="w-full lg:w-5/12 p-6 lg:p-8 flex flex-col justify-center text-white border-b lg:border-b-0 lg:border-r border-white/20 bg-white/5">
          <div className="mb-4">
             <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
             </div>
             <h1 className="text-2xl lg:text-3xl font-bold mb-3 tracking-tight">CircleSeed ERP</h1>
             <p className="text-white/90 text-sm leading-relaxed">
               Securely recover your account and regain access to all your business management tools.
             </p>
          </div>
        </div>

        {/* Right Div - Content */}
        <div className="w-full lg:w-7/12 p-6 lg:p-8 bg-white/30 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <LayoutWrapper>
        <div className="text-center lg:text-left">
          <div className="text-red-700 mb-4 flex justify-center lg:justify-start drop-shadow-md">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-900 font-medium text-sm mb-6">
            The password reset link is missing or invalid. Please request a new one.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg text-sm"
          >
            Request New Link
          </button>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Set New Password</h2>
        <p className="text-gray-800 font-medium text-sm">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full bg-white/50 border border-white/50 p-3 pr-10 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition shadow-sm text-gray-900 placeholder-gray-600 font-medium"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 transition"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="w-full bg-white/50 border border-white/50 p-3 pr-10 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition shadow-sm text-gray-900 placeholder-gray-600 font-medium"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 transition"
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 mt-2 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="mt-6 text-center lg:text-left">
            <Link
              to="/login"
              className="text-sm font-extrabold text-gray-900 hover:text-blue-800 transition flex items-center justify-center lg:justify-start gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Login
            </Link>
          </div>
      </form>
    </LayoutWrapper>
  );
};

export default ResetPassword;
