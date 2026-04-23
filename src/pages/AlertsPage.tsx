import { useState } from "react";
import { ViewModeToggle } from "../components/ViewModeToggle";
import { FunnelIcon } from "@heroicons/react/24/outline";

type ViewMode = "card" | "list";
type StatusFilter = "all" | "ongoing" | "completed";

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
];

export function AlertsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [appliedFilter, setAppliedFilter] = useState<StatusFilter>("all");
  const [draftFilter, setDraftFilter] = useState<StatusFilter>("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [alertStatuses, setAlertStatuses] = useState<Record<number, boolean>>(
    Object.fromEntries(alerts.map((alert) => [alert.id, alert.isCompleted]))
  );

  const toggleAlertStatus = (alertId: number) => {
    setAlertStatuses((prev) => ({
      ...prev,
      [alertId]: !prev[alertId],
    }));
  };

  const openFilterModal = () => {
    setDraftFilter(appliedFilter);
    setIsFilterModalOpen(true);
  };

  const clearFilter = () => {
    setDraftFilter("all");
  };

  const cancelFilter = () => {
    setIsFilterModalOpen(false);
  };

  const applyFilter = () => {
    setAppliedFilter(draftFilter);
    setIsFilterModalOpen(false);
  };

  const filteredAlerts = alerts.filter((alert) => {
    const isCompleted = alertStatuses[alert.id] ?? alert.isCompleted;

    if (appliedFilter === "completed") {
      return isCompleted;
    }
    if (appliedFilter === "ongoing") {
      return !isCompleted;
    }
    return true;
  });

  const cardAlerts =
    appliedFilter === "all"
      ? [...filteredAlerts].sort((a, b) => {
          const aCompleted = alertStatuses[a.id] ?? a.isCompleted;
          const bCompleted = alertStatuses[b.id] ?? b.isCompleted;

          if (aCompleted === bCompleted) {
            return 0;
          }
          return aCompleted ? 1 : -1;
        })
      : filteredAlerts;

  return (
    <div className="flex-1 min-h-full bg-[#E5E5E5] p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <button
          type="button"
          onClick={openFilterModal}
          aria-label="Open filter"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-[#D5FF9E] text-black transition-colors hover:bg-[#BEEA7A]"
        >
          <FunnelIcon className="h-6 w-6" />
        </button>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cardAlerts.map((alert, index) => (
            <article key={`${alert.id}-${index}`} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <p className="text-sm font-semibold text-gray-900">#{alert.id}</p>
                <button
                  type="button"
                  onClick={() => toggleAlertStatus(alert.id)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                    alertStatuses[alert.id]
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
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
                  className="h-12 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 bg-gray-100"
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
                className="mt-1 cursor-pointer rounded-lg bg-[#D5FF9E] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 ease-out hover:bg-[#BEEA7A]"
              >
                View Information
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-200">
            {filteredAlerts.map((alert, index) => (
              <li key={`${alert.id}-${index}`} className="flex items-center justify-between p-4">
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

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filter Alerts</h3>
              <button
                type="button"
                onClick={clearFilter}
                className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-[#3F8EFC] transition-colors hover:bg-blue-50"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50">
                <input
                  type="radio"
                  name="statusFilter"
                  value="all"
                  checked={draftFilter === "all"}
                  onChange={() => setDraftFilter("all")}
                />
                <span className="text-sm text-gray-800">All</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50">
                <input
                  type="radio"
                  name="statusFilter"
                  value="ongoing"
                  checked={draftFilter === "ongoing"}
                  onChange={() => setDraftFilter("ongoing")}
                />
                <span className="text-sm text-gray-800">Ongoing</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50">
                <input
                  type="radio"
                  name="statusFilter"
                  value="completed"
                  checked={draftFilter === "completed"}
                  onChange={() => setDraftFilter("completed")}
                />
                <span className="text-sm text-gray-800">Completed</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelFilter}
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyFilter}
                className="cursor-pointer rounded-md bg-[#D5FF9E] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#BEEA7A]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
