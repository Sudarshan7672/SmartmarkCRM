import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import BACKEND_URL from "../../configs/constants";
import { useNavigate } from "react-router-dom";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      })
      .then((response) => {
        setIsLoggedIn(response.data.isauthenticated);
        setUser(response.data.user);
        if (response.data.isauthenticated) {
          setUsername(response.data.user.username);
        }
      })
      .catch((error) => {
        console.error("Error checking authentication:", error);
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/login`,
        { username, password },
        { withCredentials: true } // important for sending cookies/session
      );

      if (res.status === 200) {
        setIsLoggedIn(true);
        setIsLoading(false);
        navigate("/dashboard"); // Redirect to the dashboard or home page
        setUsername("");
        setPassword("");
        window.location.reload(); // Reload the page to reflect the login state
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/logout`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setIsLoggedIn(false);
        setUsername("");
        setPassword("");
        window.location.reload(); // Reload the page to reflect the logout state
      }
    } catch (err) {
      setError("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/auth/isauthenticated`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          setIsLoggedIn(true);
          setUsername(res.data?.username); // Assuming the response contains the username
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {isLoggedIn && (
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            Back to dashboard
          </Link>
        </div>
      )}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {isLoggedIn ? "Welcome Back!" : "Log In"}
            </h1>
            {!isLoggedIn && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your username and password to Log in !
              </p>
            )}
          </div>

          {!isLoggedIn ? (
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="text-error-500 font-semibold">{error}</div>
                )}

                <div>
                  <Button className="w-full" size="sm" type="submit">
                    Log in
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="">
              <p className="mb-4 pl-2 text-gray-700 dark:text-gray-300">
                You are logged in as <strong>{user.fullname}</strong>
              </p>
              <Button className="w-full" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
