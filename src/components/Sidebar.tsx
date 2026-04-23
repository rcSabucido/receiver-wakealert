import { Link, useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">WakeAlert</h1>
      <nav className="flex-1">
        <Link
          to="/alerts"
          className="block py-3 px-4 rounded hover:bg-gray-700 transition mb-2"
        >
          Alerts
        </Link>
        <Link
          to="/locations"
          className="block py-3 px-4 rounded hover:bg-gray-700 transition mb-2"
        >
          Locations
        </Link>
      </nav>
      <button
        onClick={handleSignOut}
        className="w-full py-3 px-4 bg-red-600 rounded hover:bg-red-700 transition font-semibold"
      >
        Sign Out
      </button>
    </div>
  );
}
