import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import InformationModal from "../components/InformationModal";
import WebSocketClient from "../lib/websocket";
import { MapView } from "../components/MapView";
import {
  alertAPI,
  type AlertItem as ApiAlertItem,
  type VictimDetails,
} from "../lib/api";

type ViewAlert = {
  id: number;
  firstName: string;
  lastName: string;
  latitude: string;
  longitude: string;
  alertTime: string;
  isCompleted: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

type ToastKind = "success" | "error";

export function LocationsPage() {
  const location = useLocation();
  const userData = location.state?.userData;
  const [alertsData, setAlertsData] = useState<ApiAlertItem[]>([]);
  const [newAlert, setNewAlert] = useState<ApiAlertItem | null>(null);
  const [victimDetailsById, setVictimDetailsById] = useState<
    Record<number, VictimDetails>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Ongoing" | "Completed">("Ongoing");
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [isCardCollapsed, setisCardCollapsed] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(
    null
  );

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<ApiAlertItem | null>(
    null
  );

  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    let cancelled = false;

    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const data = await alertAPI.getAlerts();
        if (cancelled) return;
        const active = data.filter((alert) => !alert.isDeleted);
        setAlertsData(active);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load alerts");
        setAlertsData([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAlerts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (alertsData.length === 0) return;

    const missingIds = Array.from(
      new Set(alertsData.map((alert) => alert.VictimID))
    ).filter((id) => !victimDetailsById[id]);

    if (missingIds.length === 0) return;

    let cancelled = false;

    const fetchVictimDetails = async () => {
      const results = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const details = await alertAPI.getVictimDetails(id);
            if (details["address"] !== null && details["address"] !== undefined) {
              details["address"] = details["address"].replaceAll("▞", ", ");
            }
            return { id, details };
          } catch {
            return { id, details: null };
          }
        })
      );

      if (cancelled) return;

      setVictimDetailsById((prev) => {
        const next = { ...prev };
        results.forEach((result) => {
          if (result.details) next[result.id] = result.details;
        });
        return next;
      });
    };

    fetchVictimDetails();
    return () => {
      cancelled = true;
    };
  }, [alertsData, victimDetailsById]);

  useEffect(() => {
    if (!userData) return;
    setSelectedAlertId(userData.AlertID);
    setActiveTab(userData.isCompleted ? "Completed" : "Ongoing");

    const highlightTimer = setTimeout(() => {
      const element = cardRefs.current[userData.AlertID];
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 150);

    const clearTimer = setTimeout(() => {
      setSelectedAlertId(null);
    }, 700);

    return () => {
      clearTimeout(highlightTimer);
      clearTimeout(clearTimer);
    };
  }, [userData, alertsData.length]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (newAlert == null) {
      return;
    }

    alertsData.splice(0, 0, newAlert);
    setAlertsData(alertsData);
    setNewAlert(null);
  }, [newAlert, alertsData]);

  const formatAlertDate = (value: string): string => {
    if (!value) return "";
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value.split(" ")[0] ?? value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getNameParts = (
    details: VictimDetails | undefined,
  ): { firstName: string; lastName: string } => {
    if (details?.firstName || details?.lastName) {
      return {
        firstName: details?.firstName ?? "",
        lastName: details?.lastName ?? "",
      };
    }
    if (details?.fullName) {
      const [first, ...rest] = details.fullName.split(" ");
      return {
        firstName: first ?? "",
        lastName: rest.join(" "),
      };
    }
    return { firstName: "", lastName: "" };
  };

  const viewAlerts: ViewAlert[] = alertsData.map((alert) => {
    const details = victimDetailsById[alert.VictimID];
    const nameParts = getNameParts(details);
    return {
      id: alert.AlertID,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      latitude: alert.Latitude,
      longitude: alert.Longitude,
      alertTime: formatAlertDate(alert.AlertTime),
      isCompleted: alert.isCompleted,
    };
  });

  const filteredAlerts = viewAlerts.filter((alert) =>
    activeTab === "Ongoing" ? !alert.isCompleted : alert.isCompleted
  );

  const toggleStatus = async (id: number) => {
    const current = alertsData.find((alert) => alert.AlertID === id);
    if (!current) return;
    const nextStatus = !current.isCompleted;

    setAlertsData((prev) =>
      prev.map((alert) =>
        alert.AlertID === id ? { ...alert, isCompleted: nextStatus } : alert
      )
    );

    try {
      await alertAPI.updateAlert(id, { isCompleted: nextStatus });
      setToast({ message: "Alert status updated.", kind: "success" });
    } catch {
      setAlertsData((prev) =>
        prev.map((alert) =>
          alert.AlertID === id
            ? { ...alert, isCompleted: current.isCompleted }
            : alert
        )
      );
      setToast({ message: "Failed to update alert status.", kind: "error" });
    }
  };

  const handleCardClick = (alert: ViewAlert) => {
    setSelectedAlertId(alert.id);
  };

  const handleOpenModal = (alertId: number) => {
    const alert = alertsData.find((item) => item.AlertID === alertId) ?? null;
    if (!alert) return;
    setSelectedPatient(alert);
    setIsModalOpen(true);
  };

  const handleAlertMessage = (message: MessageEvent) => {
    const alert = alertAPI.stringToAlert(message.data);
    setSelectedAlertId(null);
    setNewAlert(alert);
  };

  return (
    <div className="flex h-full w-full bg-[#E5E7EB] overflow-hidden font-sans">
      <div
        className={`relative flex flex-col bg-[#F3F4F6] border-r border-gray-300 transition-all 
                    duration-300 ${isCardCollapsed ? "w-0 overflow-hidden" : "w-[300px]"
        }`}
      >
        <WebSocketClient
          url={`${API_BASE_URL}/alerts_broadcast`}
          onMessage={handleAlertMessage}
        />

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
          {isLoading && (
            <div className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">
              Loading alerts...
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}
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
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(alert.id);
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
          onMarkerClick={(alert) => handleOpenModal(alert.id)}
        />
      </div>
          
      <InformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={selectedPatient}
      />

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[9999] w-full max-w-xs"
          aria-live="polite"
        >
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.kind === "success"
                ? "border-green-200 bg-green-100 text-green-800"
                : "border-red-200 bg-red-100 text-red-800"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}