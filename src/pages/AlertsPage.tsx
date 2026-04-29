import { useState } from "react";
import { ViewModeToggle } from "../components/ViewModeToggle";
import { FunnelIcon, TrashIcon } from "@heroicons/react/24/outline";
import InformationModal from "../components/InformationModal";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

type ViewMode = "card" | "list";
type StatusFilter = "all" | "ongoing" | "completed";
type SortField = "id" | "name" | "alertTime" | "location" | "status";
type SortDirection = "asc" | "desc";

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
    id: 4,
    firstName: "Ana",
    lastName: "Garcia",
    location: "Blk 3, Lot 15,\nBarangay San Roque, Something City,\nBatangas",
    alertTime: "2026-04-21 17:05",
    isCompleted: true,
  },
  {
    id: 5,
    firstName: "Luis",
    lastName: "Martinez",
    location: "Blk 8, Lot 20,\nBarangay Santo Tomas, Something City,\nLaguna",
    alertTime: "2026-04-21 12:30",
    isCompleted: false,
  },
  { id: 6, 
    firstName: "Sofia", 
    lastName: "Lopez", 
    location: "Blk 6, Lot 12,\nBarangay San Isidro, Something City,\nQuezon", 
    alertTime: "2026-04-21 19:45", 
    isCompleted: true 
  }
];

export function AlertsPage() {
  const [alertsData, setAlertsData] = useState<AlertItem[]>(alerts);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<StatusFilter>("all");
  const [draftFilter, setDraftFilter] = useState<StatusFilter>("all");
  const [filterPopoverPosition, setFilterPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [pendingDeleteAlertId, setPendingDeleteAlertId] = useState<number | null>(null);
  const [openOptionsMenu, setOpenOptionsMenu] = useState<{
    alertId: number;
    top: number;
    left: number;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  } | null>(null);
  const [alertStatuses, setAlertStatuses] = useState<Record<number, boolean>>(
    Object.fromEntries(alerts.map((alert) => [alert.id, alert.isCompleted]))
  );

  const navigate = useNavigate(); 
  const handleViewLocation = (alert: AlertItem) => {
  navigate("/locations", { state: { userData: alert } });
};
  
  const toggleAlertStatus = (alertId: number) => {
    setAlertStatuses((prev) => ({
      ...prev,
      [alertId]: !prev[alertId],
    }));
  };

  const deleteAlert = (alertId: number) => {
    setAlertsData((prev) => prev.filter((alert) => alert.id !== alertId));
    setOpenOptionsMenu((prev) => (prev?.alertId === alertId ? null : prev));
    setAlertStatuses((prev) => {
      const next = { ...prev };
      delete next[alertId];
      return next;
    });
  };

  const toggleOptionsMenu = (alertId: number, anchor: HTMLButtonElement) => {
    const anchorRect = anchor.getBoundingClientRect();

    setOpenOptionsMenu((prev) =>
      prev?.alertId === alertId
        ? null
        : {
            alertId,
            top: anchorRect.bottom + 6,
            left: anchorRect.right,
          }
    );
  };

  const openDeleteConfirmation = (alertId: number) => {
    setPendingDeleteAlertId(alertId);
  };

  const cancelDelete = () => {
    setPendingDeleteAlertId(null);
  };

  const confirmDelete = () => {
    if (pendingDeleteAlertId === null) {
      return;
    }

    deleteAlert(pendingDeleteAlertId);
    setPendingDeleteAlertId(null);
  };

  const openFilterPopover = (anchor: HTMLButtonElement) => {
    const anchorRect = anchor.getBoundingClientRect();

    setDraftFilter(appliedFilter);
    setFilterPopoverPosition({
      top: anchorRect.bottom + 6,
      left: anchorRect.right,
    });
  };

  const clearFilter = () => {
    setDraftFilter("all");
  };

  const cancelFilter = () => {
    setFilterPopoverPosition(null);
  };

  const applyFilter = () => {
    setAppliedFilter(draftFilter);
    setFilterPopoverPosition(null);
  };

  const toggleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev === null || prev.field !== field) {
        return { field, direction: "asc" };
      }

      return {
        field,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const filteredAlerts = alertsData.filter((alert) => {
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

  const pendingDeleteAlert =
    pendingDeleteAlertId === null ? null : alertsData.find((alert) => alert.id === pendingDeleteAlertId);
  const menuAlert =
    openOptionsMenu === null ? null : alertsData.find((alert) => alert.id === openOptionsMenu.alertId) ?? null;
  const menuAlertIsCompleted =
    menuAlert === null ? false : (alertStatuses[menuAlert.id] ?? menuAlert.isCompleted);

  const formatLocationOneLine = (location: string) =>
    location
      .split("\n")
      .map((part) => part.trim().replace(/,+$/g, ""))
      .filter(Boolean)
      .join(", ");

  const listAlerts =
    sortConfig === null
      ? filteredAlerts
      : [...filteredAlerts].sort((a, b) => {
          const aCompleted = alertStatuses[a.id] ?? a.isCompleted;
          const bCompleted = alertStatuses[b.id] ?? b.isCompleted;

          let compareValue = 0;

          if (sortConfig.field === "id") {
            compareValue = a.id - b.id;
          }

          if (sortConfig.field === "name") {
            compareValue = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          }

          if (sortConfig.field === "alertTime") {
            compareValue = a.alertTime.localeCompare(b.alertTime);
          }

          if (sortConfig.field === "location") {
            compareValue = formatLocationOneLine(a.location).localeCompare(formatLocationOneLine(b.location));
          }

          if (sortConfig.field === "status") {
            compareValue = Number(aCompleted) - Number(bCompleted);
          }

          return sortConfig.direction === "asc" ? compareValue : -compareValue;
        });

  const getSortIcon = (field: SortField) => {
    if (sortConfig?.field !== field) {
      return null;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUpIcon className="h-3 w-3" />
    ) : (
      <ArrowDownIcon className="h-3 w-3" />
    );
  };

  return (
    <div className="flex-1 min-h-full bg-[#E5E5E5] p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <button
          type="button"
          onClick={(event) => openFilterPopover(event.currentTarget)}
          aria-label="Open filter"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-[#D5FF9E] text-black transition-colors hover:bg-[#BEEA7A]"
        >
          <FunnelIcon className="h-6 w-6" />
        </button>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cardAlerts.map((alert, index) => {
            const isCompleted = alertStatuses[alert.id] ?? alert.isCompleted;

            return (
            <article key={`${alert.id}-${index}`} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <p className="text-sm font-semibold text-gray-900">#{alert.id}</p>
                <button
                  type="button"
                  onClick={() => toggleAlertStatus(alert.id)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                    isCompleted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {isCompleted ? "Completed" : "Ongoing"}
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Location:</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-700">{alert.location}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleViewLocation(alert); 
                  }}
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

              <div className="mt-1 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAlert(alert);
                    setIsInfoModalOpen(true);
                  }}
                  className={`flex h-10 items-center justify-center cursor-pointer rounded-lg 
                    bg-[#D5FF9E] px-4 text-sm font-semibold hover:bg-[#BEEA7A] ${
                    isCompleted ? "flex-1" : "w-full"
                  }`}
                >
                  View Information
                </button>
                {isCompleted && (
                  <button
                    type="button"
                    onClick={() => openDeleteConfirmation(alert.id)}
                    aria-label={`Delete alert ${alert.id}`}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-red-100 text-red-700 transition-colors hover:bg-red-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <button
                      type="button"
                      onClick={() => toggleSort("id")}
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                    >
                      Victim ID
                      {getSortIcon("id")}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                    >
                      Name
                      {getSortIcon("name")}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <button
                      type="button"
                      onClick={() => toggleSort("alertTime")}
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                    >
                      Alert Time
                      {getSortIcon("alertTime")}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <button
                      type="button"
                      onClick={() => toggleSort("location")}
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                    >
                      Location
                      {getSortIcon("location")}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                    >
                      Status
                      {getSortIcon("status")}
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {listAlerts.map((alert, index) => {
                  const isCompleted = alertStatuses[alert.id] ?? alert.isCompleted;

                  return (
                    <tr key={`${alert.id}-${index}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">#{alert.id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                        {alert.firstName} {alert.lastName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{alert.alertTime}</td>
                      <td className="max-w-xs px-4 py-3 text-sm leading-5 text-gray-700">
                        <p className="truncate" title={formatLocationOneLine(alert.location)}>
                          {formatLocationOneLine(alert.location)}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                        <span
                          className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                            isCompleted
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCompleted ? "Completed" : "Ongoing"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          aria-label={`Open options for alert ${alert.id}`}
                          onClick={(event) => toggleOptionsMenu(alert.id, event.currentTarget)}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {openOptionsMenu !== null && menuAlert !== null && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setOpenOptionsMenu(null)}
                aria-hidden="true"
              />
              <div
                className="fixed z-30 w-44 -translate-x-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
                style={{ top: openOptionsMenu.top, left: openOptionsMenu.left }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAlert(menuAlert);
                    setIsInfoModalOpen(true);
                    setOpenOptionsMenu(null);
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                >
                  View Information
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenOptionsMenu(null);
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                >
                  View Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleAlertStatus(menuAlert.id);
                    setOpenOptionsMenu(null);
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                >
                  Change Status
                </button>
                {menuAlertIsCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      openDeleteConfirmation(menuAlert.id);
                      setOpenOptionsMenu(null);
                    }}
                    className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50"
                  >
                    Delete Alert
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <InformationModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedAlert(null);
        }}
        userData={selectedAlert}
      />

      {filterPopoverPosition !== null && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={cancelFilter}
            aria-hidden="true"
          />
          <div
            className="fixed z-40 w-72 -translate-x-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
            style={{ top: filterPopoverPosition.top, left: filterPopoverPosition.left }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Filter Alerts</h3>
              <button
                type="button"
                onClick={clearFilter}
                className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-[#3F8EFC] transition-colors hover:bg-blue-50"
              >
                Clear
              </button>
            </div>

            <div className="space-y-1">
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

            <div className="mt-4 flex justify-end gap-2">
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
        </>
      )}

      {pendingDeleteAlertId !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Alert</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete alert
              {pendingDeleteAlert && (
                <>
                  {" "}
                  <span className="font-semibold">#{pendingDeleteAlert.id}</span>
                  {" for "}
                  <span className="font-semibold">
                    {pendingDeleteAlert.firstName} {pendingDeleteAlert.lastName}
                  </span>
                </>
              )}
              ?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="min-w-28 cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="min-w-28 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
