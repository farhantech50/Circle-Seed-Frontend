import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-navbar-bg">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-navbar-text">Tuition Media</h1>

        <p className="text-text-light">Find the right tutor for you</p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate("/login")}
            className="
              px-6 py-2 rounded-lg
              bg-button-primary text-white
              font-medium
              hover:bg-button-primary-hover
              transition-colors
            "
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="
              px-6 py-2 rounded-lg
              border border-primary-500
              text-primary-500
              bg-button-light
              font-medium
              hover:bg-button-secondary-hover
              transition-colors
            "
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
