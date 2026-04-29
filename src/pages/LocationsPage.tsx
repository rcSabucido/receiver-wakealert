import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
  { id: 1, 
    firstName: "Juan", 
    lastName: "Dela Cruz", 
    latitude: "-25.8482763", 
    longitude: "32.5938118", 
    alertTime: "2026-02-21 14:35", 
    isCompleted: false 
  },
  { id: 2, 
    firstName: "Pedro", 
    lastName: "Reyes", 
    latitude: "-25.8482763", 
    longitude: "32.5938118", 
    alertTime: "2026-02-21 22:47", 
    isCompleted: true 
  },
  { id: 3, 
    firstName: "Maria", 
    lastName: "Santos", 
    latitude: "-25.8482763", 
    longitude: "32.5938118", 
    alertTime: "2026-02-21 09:18", 
    isCompleted: false 
  },
];

export function LocationsPage() {
  const location = useLocation();
  const userData = location.state?.userData;
  const [alertsData, setAlertsData] = useState<AlertItem[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<"Ongoing" | "Completed">("Ongoing");
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

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
                isCompleted: userData.isCompleted 
              }
            : alert
        )
      );

      setActiveTab(userData.isCompleted ? "Completed" : "Ongoing");

      const timer = setTimeout(() => {
        setSelectedAlertId(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [userData]);

  const toggleStatus = (id: number) => {
    setAlertsData((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isCompleted: !alert.isCompleted } : alert
      )
    );
  };

  const filteredAlerts = alertsData.filter((alert) =>
    activeTab === "Ongoing" ? !alert.isCompleted : alert.isCompleted
  );

  return (
    <div className="flex h-screen w-full bg-[#E5E7EB] overflow-hidden font-sans">
      
      {/* Sidebar List Section */}
      <div className="w-[420px] flex flex-col bg-[#F3F4F6] border-r border-gray-300">
        
        {/* Navigation Tabs */}
        <div className="p-4">
          <div className="flex bg-[#3F8EFC] p-1 rounded-lg border border-blue-600">
            <button 
              onClick={() => setActiveTab("Ongoing")} 
              className={`flex-1 py-2 cursor-pointer text-sm font-semibold rounded-md transition-all ${activeTab === "Ongoing" ? "bg-[#D5FF9E] text-black" : "text-white"}`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => setActiveTab("Completed")} 
              className={`flex-1 py-2 cursor-pointer text-sm font-semibold rounded-md transition-all ${activeTab === "Completed" ? "bg-[#D5FF9E] text-black" : "text-white"}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Scrollable List of Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {filteredAlerts.map((alert) => {
            const isHighlighted = selectedAlertId === alert.id;

            return (
              <div 
                key={alert.id} 
                className={`bg-white rounded-xl p-6 transition-all duration-700 border-2 ${
                  isHighlighted 
                    ? "border-[#3F8EFC] shadow-[0_0_15px_rgba(63,142,252,0.15)] ring-1 ring-[#3F8EFC]" 
                    : "border-transparent shadow-sm"
                }`}
              >
                {/* ID and Badge */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                  <span className={`font-semibold text-xl transition-colors duration-700 ${isHighlighted ? "text-[#3F8EFC]" : "text-gray-800"}`}>
                    #{alert.id}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(alert.id);
                    }}
                    className={`text-[12.5px] px-3 py-1 cursor-pointer rounded font-semibold tracking-wider ${
                      alert.isCompleted ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                    }`}
                  >
                    {alert.isCompleted ? "Completed" : "Ongoing"}
                  </button>
                </div>

                {/* Patient Data Grid */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Latitude:</span>
                    <span className="text-gray-700 font-medium tracking-tight">{alert.latitude}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Longitude:</span>
                    <span className="text-gray-700 font-medium tracking-tight">{alert.longitude}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Name:</span>
                    <span className="text-gray-700 font-medium">{`${alert.firstName} ${alert.lastName}`}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Alert Time:</span>
                    <span className="text-gray-700 font-medium tracking-tight">{alert.alertTime}</span>
                  </div>
                </div>

                <button className="w-full cursor-pointer bg-[#D5FF9E] hover:bg-[#c2f080] text-black font-semibold py-3 
                        rounded-lg text-sm shadow-sm transition-all active:scale-[0.98]">
                  View Information
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map View Object Placeholder */}
      <div className="flex-1 bg-white relative">
         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center opacity-40">
           <p className="text-gray-400 font-black italic tracking-widest uppercase">[ Map Component Placeholder ]</p>
         </div>
      </div>

    </div>
  );
}