import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import InformationModal from "../components/InformationModal";
import { MapView } from "../components/MapView";

type AlertItem = {
  id: number;
  firstName: string;
  lastName: string;
  latitude: string;
  longitude: string;
  alertTime: string;
  isCompleted: boolean;
};

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    firstName: "Juan",
    lastName: "Dela Cruz",
    latitude: "7.0842",
    longitude: "125.6234",
    alertTime: "2026-02-21 14:35",
    isCompleted: false,
  },
  {
    id: 2,
    firstName: "Pedro",
    lastName: "Reyes",
    latitude: "7.1456",
    longitude: "125.6789",
    alertTime: "2026-02-21 22:47",
    isCompleted: true,
  },
  {
    id: 3,
    firstName: "Maria",
    lastName: "Santos",
    latitude: "7.0512",
    longitude: "125.5932",
    alertTime: "2026-02-21 09:18",
    isCompleted: false,
  },
  {
    id: 4,
    firstName: "Ana",
    lastName: "Garcia",
    latitude: "7.1234",
    longitude: "125.6512",
    alertTime: "2026-02-21 17:05",
    isCompleted: true,
  },
  {
    id: 5,
    firstName: "Luis",
    lastName: "Martinez",
    latitude: "6.9876",
    longitude: "125.5678",
    alertTime: "2026-02-21 12:30",
    isCompleted: false,
  },
  {
    id: 6,
    firstName: "Sofia",
    lastName: "Lopez",
    latitude: "7.1089",
    longitude: "125.6945",
    alertTime: "2026-02-21 19:45",
    isCompleted: true,
  },
];

export function LocationsPage() {
  const location = useLocation();
  const userData = location.state?.userData;
  const [alertsData, setAlertsData] = useState<AlertItem[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<"Ongoing" | "Completed">("Ongoing");
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isCardCollapsed, setisCardCollapsed] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (userData) {
      setSelectedAlertId(userData.id);

      setAlertsData((prev) =>
        prev.map((alert) =>
          alert.id === userData.id
            ? {
                ...alert,
                firstName: userData.firstName,
                lastName: userData.lastName,
                alertTime: userData.alertTime,
                isCompleted: userData.isCompleted,
              }
            : alert
        )
      );

      setActiveTab(userData.isCompleted ? "Completed" : "Ongoing");

      setTimeout(() => {
        const element = cardRefs.current[userData.id];
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 150);

      // Clear highlight after 700 milliseconds
      const timer = setTimeout(() => {
        setSelectedAlertId(null);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [userData]);

  const toggleStatus = (id: number) => {
    setAlertsData((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, isCompleted: !alert.isCompleted }
          : alert
      )
    );
  };

  const filteredAlerts = alertsData.filter((alert) =>
    activeTab === "Ongoing" ? !alert.isCompleted : alert.isCompleted
  );

  const handleCardClick = (alert: AlertItem) => {
    setSelectedAlertId(alert.id);
  };

  const handleOpenModal = (alert: AlertItem) => {
    setSelectedPatient(alert);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-full w-full bg-[#E5E7EB] overflow-hidden font-sans">

      {/* List Section */}
      <div
        className={`relative flex flex-col bg-[#F3F4F6] border-r border-gray-300 transition-all 
                    duration-300 ${isCardCollapsed ? "w-0 overflow-hidden" : "w-[300px]"
        }`}
      >
        {/* Navigation Tabs */}
        <div className="p-2">
          <div className="flex bg-[#3F8EFC] p-1 rounded-lg border border-blue-600">
            <button
              onClick={() => setActiveTab("Ongoing")}
              className={`flex-1 py-2 cursor-pointer text-sm font-semibold rounded-md transition-all ${
                activeTab === "Ongoing"
                  ? "bg-[#D5FF9E] text-black"
                  : "text-white"
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setActiveTab("Completed")}
              className={`flex-1 py-2 cursor-pointer text-sm font-semibold rounded-md transition-all ${
                activeTab === "Completed"
                  ? "bg-[#D5FF9E] text-black"
                  : "text-white"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Scrollable List of Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
          {filteredAlerts.map((alert) => {
            const isHighlighted = selectedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                ref={(el) => {
                  cardRefs.current[alert.id] = el;
                }}
                onClick={() => handleCardClick(alert)}
                className={`bg-white rounded-xl p-4 transition-all duration-700 border-2 ${
                  isHighlighted
                    ? "border-[#3F8EFC] shadow-[0_0_15px_rgba(63,142,252,0.15)] ring-1 ring-[#3F8EFC]"
                    : "border-transparent shadow-sm"
                }`}
              >
                {/* ID and Badge */}
                <div className="flex justify-between items-center mb-3 border-b border-gray-500 pb-1.5">
                  <span
                    className={`font-semibold text-sm transition-colors duration-700 ${
                      isHighlighted ? "text-[#3F8EFC]" : "text-gray-800"
                    }`}
                  >
                    #{alert.id}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(alert.id);
                    }}
                    className={`text-[12px] px-2 py-1 cursor-pointer rounded font-semibold tracking-wider ${
                      alert.isCompleted
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {alert.isCompleted ? "Completed" : "Ongoing"}
                  </button>
                </div>

                {/* Data Grid */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-black-700 font-sm">Latitude:</span>
                    <span className="text-black-700 font-sm tracking-tight">
                      {alert.latitude}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-black-700 font-sm">Longitude:</span>
                    <span className="text-black-700 font-sm tracking-tight">
                      {alert.longitude}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-black-700 font-sm">Name:</span>
                    <span className="text-black-700 font-sm">{`${alert.firstName} ${alert.lastName}`}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-black-700 font-sm">Alert Time:</span>
                    <span className="text-black-700 font-sm tracking-tight">
                      {alert.alertTime}
                    </span>
                  </div>
                </div>

                {/* View Information Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(alert);
                  }}
                  className="w-full cursor-pointer bg-[#D5FF9E] hover:bg-[#c2f080] text-black 
                             font-semibold py-1 rounded-lg text-sm shadow-sm transition-all active:scale-[0.98]"
                >
                  View Information
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <div className="relative flex items-center">
        <button
          onClick={() => setisCardCollapsed((prev) => !prev)}
          className="absolute left-0 z-9999 flex items-center justify-center
                     w-5 h-12 bg-gray-100 border border-gray-100 border-l-0
                     rounded-r-md shadow-md hover:bg-gray-200 transition-all cursor-pointer"
          title={isCardCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isCardCollapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>


      <div className="flex-1 relative">
        <MapView 
          alerts={filteredAlerts}
          focusedId={selectedAlertId}
          onMarkerClick={(alert) => handleOpenModal(alert)}
        />
      </div>

      {/* Modal Component */}
      <InformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={selectedPatient}
      />
    </div>
  );
}