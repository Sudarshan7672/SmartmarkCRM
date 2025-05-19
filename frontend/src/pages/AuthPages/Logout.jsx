import { useEffect } from "react";
import axios from "axios";
import  BASE_URL  from "../../configs/constants";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    const logout = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/auth/logout`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          navigate("/");
          window.location.reload(); // Reload the page to reflect the logout state
        }
      } catch (err) {
        console.error("Logout failed. Please try again.", err);
      }
    };

    logout();
  }, []);
  return (
    <div>
      <h1>Logout</h1>
      <p>You have been logged out successfully.</p>
    </div>
  );
}
