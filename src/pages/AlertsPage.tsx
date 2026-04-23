import { useState } from "react";
import { ViewModeToggle } from "../components/ViewModeToggle";

type ViewMode = "card" | "list";

type AlertItem = {
  id: number;
  firstName: string;
  lastName: string;
  location: string;
  alertTime: string;
  isCompleted: boolean;
};

const alerts: AlertItem[] = [
  {
    id: 1,
    firstName: "Juan",
    lastName: "Dela Cruz",
    location: "Blk 2, Lot 34,\nBarangay Sto. Nino, Something City,\nBatangas",
    alertTime: "2026-04-23 14:35",
    isCompleted: false,
  },
  {
    id: 2,
    firstName: "Maria",
    lastName: "Santos",
    location: "Blk 10, Lot 11,\nBarangay San Pedro, Something City,\nLaguna",
    alertTime: "2026-04-23 09:18",
    isCompleted: true,
  },
  {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    location: "Blk 5, Lot 7,\nBarangay Mabini, Something City,\nQuezon",
    alertTime: "2026-04-22 22:47",
    isCompleted: false,
  },
    {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    location: "Blk 5, Lot 7,\nBarangay Mabini, Something City,\nQuezon",
    alertTime: "2026-04-22 22:47",
    isCompleted: false,
  },
    {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    location: "Blk 5, Lot 7,\nBarangay Mabini, Something City,\nQuezon",
    alertTime: "2026-04-22 22:47",
    isCompleted: false,
  },
    {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    location: "Blk 5, Lot 7,\nBarangay Mabini, Something City,\nQuezon",
    alertTime: "2026-04-22 22:47",
    isCompleted: false,
  },
    {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    location: "Blk 5, Lot 7,\nBarangay Mabini, Something City,\nQuezon",
    alertTime: "2026-04-22 22:47",
    isCompleted: false,
  },
    {
    id: 3,
    firstName: "Pedro",
    lastName: "Reyes",
    location: "Blk 5, Lot 7,\nBarangay Mabini, Something City,\nQuezon",
    alertTime: "2026-04-22 22:47",
    isCompleted: false,
  },
];

export function AlertsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [alertStatuses, setAlertStatuses] = useState<Record<number, boolean>>(
    Object.fromEntries(alerts.map((alert) => [alert.id, alert.isCompleted]))
  );

  const toggleAlertStatus = (alertId: number) => {
    setAlertStatuses((prev) => ({
      ...prev,
      [alertId]: !prev[alertId],
    }));
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <article key={alert.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <p className="text-sm font-semibold text-gray-900">#{alert.id}</p>
                <button
                  type="button"
                  onClick={() => toggleAlertStatus(alert.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    alertStatuses[alert.id] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {alertStatuses[alert.id] ? "Completed" : "Ongoing"}
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Location:</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-700">{alert.location}</p>
                </div>
                <button
                  type="button"
                  aria-label="Location placeholder"
                  className="h-12 w-12 shrink-0 rounded-md border border-gray-300 bg-gray-100"
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name:</p>
                  <p className="font-semibold text-gray-900">
                    {alert.firstName} {alert.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Alert Time:</p>
                  <p className="text-sm text-gray-600">{alert.alertTime}</p>
                </div>
              </div>

              <button
                type="button"
                className="mt-1 rounded-lg bg-[#D5FF9E] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 ease-out hover:bg-[#BEEA7A]"
              >
                View Information
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {alert.firstName} {alert.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ID: {alert.id} • {alert.location.split("\n")[0]}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{alert.alertTime}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
