import { ArrowRightStartOnRectangleIcon, BellIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <div className="w-64 bg-[#3F8EFC] text-white h-screen flex flex-col items-center p-6">
        <div className="w-40 h-40 bg-white rounded-full mb-8"></div>
      <nav className="flex-1">
        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            `py-3 px-15 rounded flex gap-2 items-center transition mb-2 ${
              isActive ? "bg-[#D5FF9E] text-black" : ""
            }`
          }
        >
            <BellIcon className="w-6 h-6" />
          Alerts
        </NavLink>
        <NavLink
          to="/locations"
          className={({ isActive }) =>
            `py-3 px-15 rounded flex gap-2 items-center transition mb-2 ${
              isActive ? "bg-[#D5FF9E] text-black" : ""
            }`
          }
        >
            <MapPinIcon className="w-6 h-6" />
          Locations
        </NavLink>
      </nav>
      <button
        onClick={handleSignOut}
        className="py-3 px-15 rounded flex gap-2 items-center transition hover:bg-red-700 font-semibold whitespace-nowrap"
      >
        <ArrowRightStartOnRectangleIcon className="w-6 h-6 shrink-0" />
        Sign Out
      </button>
    </div>
  );
}
