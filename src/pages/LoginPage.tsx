import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { alertAPI } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await alertAPI.login(usernameValue, passwordValue);
      navigate("/alerts");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-white">
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <div className="h-[30vw] w-[30vw] rounded-full bg-blue-500 shadow-2xl"></div>
      </div>

      <div className="flex w-full md:w-1/2 items-start justify-start bg-blue-500 pt-[18vh] px-6 md:pl-19">
        <div className="w-full max-w-[738px]">
          <h1 className="mb-10 text-4xl font-semibold text-white tracking-tight">
            WakeAlert Receiver
          </h1>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="flex flex-col mb-8">
              <label className="block text-xl font-semibold text-white mb-3">
                Username:
              </label>
              <input
                required
                type="text"
                value={usernameValue}
                onChange={(e) => setUsernameValue(e.target.value)}
                className="w-full h-12 rounded-xl p-4 shadow-xl outline-none text-gray-800 bg-white transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xl font-semibold text-white mb-3">
                Password:
              </label>
              <div className="relative w-full">
                <input
                  required
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full h-12 rounded-xl p-4 pr-12 shadow-xl outline-none bg-white transition-all text-gray-800"
                />
                {passwordValue.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-6 w-6" />
                    ) : (
                      <EyeIcon className="h-6 w-6" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-200 font-medium text-sm -mt-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-lime-200 font-bold text-gray-800 shadow-lg text-xl mt-2 hover:bg-lime-300 transition-colors disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;