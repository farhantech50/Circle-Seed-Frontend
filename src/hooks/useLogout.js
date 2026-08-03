import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logoutUser } from "../utils/logoutUser";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#234C6A",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Logout",
    });

    if (confirm.isConfirmed) {
      await logoutUser();
      navigate("/login");
    }
  };

  return { logout };
};

export default useLogout;
