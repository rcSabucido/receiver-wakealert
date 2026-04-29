import { useState } from "react";

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
    firstName: "Juan ",
    lastName: "Dela Cruz",
    latitude: "-25.8482763",
    longitude: "32.5938118",
    alertTime: "2026-02-21 14:35",
    isCompleted: false,
  },
  {
    id: 2,
    firstName: "Pedro ",
    lastName: "Reyes",
    latitude: "-25.8482763",
    longitude: "32.5938118",
    alertTime: "2026-02-21 22:47",
    isCompleted: false,
  },
  {
    id: 3,
    firstName: "Maria ",
    lastName: "Santos",
    latitude: "-25.8482763",
    longitude: "32.5938118",
    alertTime: "2026-02-21 09:18",
    isCompleted: false,
  },
];

export function LocationsPage() {
  const [alertsData, setAlertsData] = useState<AlertItem[]>(initialAlerts);
  const [activeTab, setActiveTab] = useState<"Ongoing" | "Completed">("Ongoing");

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
    <div className="flex h-screen w-full bg-[#E5E7EB] overflow-hidden">
      
      {/* Left Column: List Section */}
      <div className="w-[420px] flex flex-col bg-[#F3F4F6] border-r border-gray-300">
        
        {/* Top Toggle Bar */}
        <div className="p-4 bg-gray-100">
          <div className="flex bg-[#3F8EFC] p-1 rounded-lg border border-blue-600">
            <button
              onClick={() => setActiveTab("Ongoing")}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === "Ongoing" 
                ? "bg-[#D5FF9E] text-black" 
                : "text-white"
              }`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setActiveTab("Completed")}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === "Completed" 
                ? "bg-[#D5FF9E] text-black" 
                : "text-white"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Scrollable Cards */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="font-semibold text-gray-800 text-lg">#{alert.id}</span>
                <button
                  onClick={() => toggleStatus(alert.id)}
                  className={`text-[13px] px-3 py-1 rounded font-semibold transition-colors ${
                    alert.isCompleted 
                    ? "bg-green-100 text-green-600" 
                    : "bg-red-100 text-red-400"
                  }`}
                >
                  {alert.isCompleted ? "Completed" : "Ongoing"}
                </button>
              </div>

              {/* Data Rows - All Fields Included */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">Latitude:</span>
                  <span className="text-gray-700 font-semibold">{alert.latitude}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">Longitude:</span>
                  <span className="text-gray-700 font-semibold">{alert.longitude}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">Name:</span>
                  <span className="text-gray-700 font-semibold">{alert.firstName} {alert.lastName}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">Alert Time:</span>
                  <span className="text-gray-700 font-semibold">{alert.alertTime}</span>
                </div>
              </div>

              <button className="w-full bg-[#D5FF9E] hover:bg-[#c2f080] text-black font-semibold 
                      py-2.5 rounded-lg transition-colors text-sm shadow-sm">
                View Information
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Empty Map View Object */}
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
           <div className="text-center font-mono text-gray-400">
              <p className="text-2xl font-bold uppercase tracking-widest">[ Map View Object ]</p>
              <div className="h-1 w-48 bg-gray-300 mx-auto mt-2 rounded-full"></div>
           </div>
        </div>
      </div>

    </div>
  );
}