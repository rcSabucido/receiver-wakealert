import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/alerts");
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-linear-to-br from-gray-900 to-gray-800">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">WakeAlert</h1>
        <button
          onClick={handleLogin}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}
