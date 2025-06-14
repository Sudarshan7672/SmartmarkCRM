import { useEffect, useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Logout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loggingOut"); // "loggingOut", "success", "error"

  useEffect(() => {
    const logout = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/auth/logout`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          setStatus("success");
          localStorage.removeItem("isAuthenticated");
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 1200);
        }
      } catch (err) {
        console.error("Logout failed. Please try again.", err);
        setStatus("error");
      }
    };

    logout();
  }, []);

  return (
    <>
      <PageMeta title="Sign Out" description="Sign out from your account" />
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
        {status === "loggingOut" && (
          <>
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Logging you out...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <p className="text-green-600 dark:text-green-400 text-lg">
              You have been logged out successfully.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-red-600 font-semibold">
              Logout failed. Please try again.
            </p>
          </>
        )}
      </div>
    </>
  );
}
