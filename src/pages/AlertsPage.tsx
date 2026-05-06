import { useEffect, useRef, useState } from "react";
import { ViewModeToggle } from "../components/ViewModeToggle";
import { FunnelIcon, TrashIcon } from "@heroicons/react/24/outline";
import InformationModal from "../components/InformationModal";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { MiniMap } from "../components/MiniMap";
import { alertAPI, type AlertItem, type VictimDetails } from "../lib/api";

type ViewMode = "card" | "list";
type StatusFilter = "all" | "ongoing" | "completed";
type SortField = "id" | "victimId" | "alertTime" | "location" | "status";
type SortDirection = "asc" | "desc";
type ToastKind = "success" | "error";

export function AlertsPage() {
  const CACHE_KEY = "geocoded_addresses"
  const [alertsData, setAlertsData] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geocodedAddresses, setGeocodedAddresses] = useState<
    Record<string, string>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
    } catch {
      return {};
    }
  });

  const geocodedRef = useRef<Record<string, string>>(
  (() => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
    } catch {
      return {};
    }
  })()
);

  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [victimDetailsById, setVictimDetailsById] = useState<
    Record<number, VictimDetails>
  >({});
  const [appliedFilter, setAppliedFilter] = useState<StatusFilter>("all");
  const [draftFilter, setDraftFilter] = useState<StatusFilter>("all");
  const [filterPopoverPosition, setFilterPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [pendingDeleteAlertId, setPendingDeleteAlertId] = useState<
    number | null
  >(null);
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
    {}
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<
    Record<number, boolean>
  >({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    kind: ToastKind;
  } | null>(null);

  const navigate = useNavigate();
  const handleViewLocation = (alert: AlertItem) => {
    navigate("/locations", { state: { userData: alert } });
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const data = await alertAPI.getAlerts();
        const active = data.filter((a) => !a.isDeleted);
        setAlertsData(active);
        setAlertStatuses(
          Object.fromEntries(active.map((a) => [a.AlertID, a.isCompleted]))
        );
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch alerts"
        );
        setAlertsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
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
          if (result.details) {
            next[result.id] = result.details;
          }
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
    if (alertsData.length === 0) return;

    const coordsToFetch = [
      ...new Set(alertsData.map((a) => `${a.Latitude},${a.Longitude}`)),
    ].filter((coord) => !geocodedRef.current[coord]);

    if (coordsToFetch.length === 0) return;

    let cancelled = false;

    const geocodeAll = async () => {
      for (let i = 0; i < coordsToFetch.length; i++) {
        if (cancelled) break;

        const coord = coordsToFetch[i];
        const [lat, lon] = coord.split(",");

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 
              "Accept-Language": "en",
              "User-Agent": "receiver-wakealert/1.0 (rcsabucido@gmail.com)",
            
            } }
          );
          const json = await res.json();
          const address =
            (json.display_name as string | undefined) ?? `${lat}, ${lon}`;
          geocodedRef.current[coord] = address;
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify(geocodedRef.current)
            );
          } catch {

          }
          if (!cancelled) {
            setGeocodedAddresses((prev) => ({ ...prev, [coord]: address }));
          }
        } catch {
          const fallback = `${lat}, ${lon}`;
          geocodedRef.current[coord] = fallback;
          if (!cancelled) {
            setGeocodedAddresses((prev) => ({ ...prev, [coord]: fallback }));
          }
        }

        if (!cancelled && i < coordsToFetch.length - 1) {
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
    };

    geocodeAll();
    return () => {
      cancelled = true;
    };
  }, [alertsData]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const getAddress = (alert: AlertItem): string => {
    const key = `${alert.Latitude},${alert.Longitude}`;
    return geocodedAddresses[key] ?? `${alert.Latitude}, ${alert.Longitude}`;
  };

  const getVictimName = (alert: AlertItem): string => {
    const details = victimDetailsById[alert.VictimID];
    return details?.fullName ?? "";
  };

  const formatAlertTime = (value: string): string => {
    if (!value) return "";
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const toggleAlertStatus = async (alertId: number) => {
    if (isUpdatingStatus[alertId]) return;
    const currentAlert = alertsData.find((alert) => alert.AlertID === alertId);
    const currentStatus =
      alertStatuses[alertId] ?? currentAlert?.isCompleted ?? false;
    const nextStatus = !currentStatus;

    setAlertStatuses((prev) => ({ ...prev, [alertId]: nextStatus }));
    setIsUpdatingStatus((prev) => ({ ...prev, [alertId]: true }));

    try {
      await alertAPI.updateAlert(alertId, { isCompleted: nextStatus });
      setToast({
        message: "Alert status updated.",
        kind: "success",
      });
    } catch (err) {
      setAlertStatuses((prev) => ({ ...prev, [alertId]: currentStatus }));
      setToast({
        message: err instanceof Error ? err.message : "Failed to update alert",
        kind: "error",
      });
    } finally {
      setIsUpdatingStatus((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  const deleteAlert = (alertId: number) => {
    setAlertsData((prev) => prev.filter((a) => a.AlertID !== alertId));
    setOpenOptionsMenu((prev) => (prev?.alertId === alertId ? null : prev));
    setAlertStatuses((prev) => {
      const next = { ...prev };
      delete next[alertId];
      return next;
    });
  };

  const toggleOptionsMenu = (alertId: number, anchor: HTMLButtonElement) => {
    const rect = anchor.getBoundingClientRect();
    setOpenOptionsMenu((prev) =>
      prev?.alertId === alertId
        ? null
        : { alertId, top: rect.bottom + 6, left: rect.right }
    );
  };

  const openDeleteConfirmation = (alertId: number) =>
    setPendingDeleteAlertId(alertId);
  const cancelDelete = () => setPendingDeleteAlertId(null);
  const showToast = (message: string, kind: ToastKind) =>
    setToast({ message, kind });
  const confirmDelete = async () => {
    if (pendingDeleteAlertId === null || isDeleting) return;
    const alertId = pendingDeleteAlertId;
    const previousAlerts = alertsData;
    const previousStatuses = alertStatuses;
    setIsDeleting(true);
    deleteAlert(alertId);
    setPendingDeleteAlertId(null);
    try {
      await alertAPI.deleteAlert(alertId);
      showToast("Alert deleted.", "success");
    } catch (err) {
      setAlertsData(previousAlerts);
      setAlertStatuses(previousStatuses);
      showToast(
        err instanceof Error ? err.message : "Failed to delete alert",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openFilterPopover = (anchor: HTMLButtonElement) => {
    const rect = anchor.getBoundingClientRect();
    setDraftFilter(appliedFilter);
    setFilterPopoverPosition({ top: rect.bottom + 6, left: rect.right });
  };
  const clearFilter = () => setDraftFilter("all");
  const cancelFilter = () => setFilterPopoverPosition(null);
  const applyFilter = () => {
    setAppliedFilter(draftFilter);
    setFilterPopoverPosition(null);
  };

  const toggleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev === null || prev.field !== field)
        return { field, direction: "asc" };
      return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUpIcon className="h-3 w-3" />
    ) : (
      <ArrowDownIcon className="h-3 w-3" />
    );
  };

  const filteredAlerts = alertsData.filter((alert) => {
    const isCompleted = alertStatuses[alert.AlertID] ?? alert.isCompleted;
    if (appliedFilter === "completed") return isCompleted;
    if (appliedFilter === "ongoing") return !isCompleted;
    return true;
  });

  const cardAlerts =
    appliedFilter === "all"
      ? [...filteredAlerts].sort((a, b) => {
          const aC = alertStatuses[a.AlertID] ?? a.isCompleted;
          const bC = alertStatuses[b.AlertID] ?? b.isCompleted;
          if (aC === bC) return 0;
          return aC ? 1 : -1;
        })
      : filteredAlerts;

  const listAlerts =
    sortConfig === null
      ? filteredAlerts
      : [...filteredAlerts].sort((a, b) => {
          const aC = alertStatuses[a.AlertID] ?? a.isCompleted;
          const bC = alertStatuses[b.AlertID] ?? b.isCompleted;
          let v = 0;
          if (sortConfig.field === "id") v = a.AlertID - b.AlertID;
          if (sortConfig.field === "victimId")
            v = getVictimName(a).localeCompare(getVictimName(b));
          if (sortConfig.field === "alertTime")
            v = a.AlertTime.localeCompare(b.AlertTime);
          if (sortConfig.field === "location")
            v = getAddress(a).localeCompare(getAddress(b));
          if (sortConfig.field === "status") v = Number(aC) - Number(bC);
          return sortConfig.direction === "asc" ? v : -v;
        });

  const allCoordsGeocoded =
    alertsData.length === 0
      ? true
      : alertsData.every((a) =>
          Boolean(geocodedAddresses[`${a.Latitude},${a.Longitude}`])
        );

  const pendingDeleteAlert =
    pendingDeleteAlertId === null
      ? null
      : alertsData.find((a) => a.AlertID === pendingDeleteAlertId);

  const menuAlert =
    openOptionsMenu === null
      ? null
      : (alertsData.find((a) => a.AlertID === openOptionsMenu.alertId) ?? null);

  const menuAlertIsCompleted =
    menuAlert === null
      ? false
      : (alertStatuses[menuAlert.AlertID] ?? menuAlert.isCompleted);

  if (isLoading) return <div className="flex-1 p-8">Loading alerts...</div>;
  if (error)
    return <div className="flex-1 p-8 text-red-800">Error: {error}</div>;

  return (
    <div className="flex-1 min-h-full bg-[#E5E5E5] p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <button
          type="button"
          onClick={(e) => openFilterPopover(e.currentTarget)}
          aria-label="Open filter"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-[#D5FF9E] text-black transition-colors hover:bg-[#BEEA7A]"
        >
          <FunnelIcon className="h-6 w-6" />
        </button>
      </div>

      {viewMode === "card" ? (
        allCoordsGeocoded ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cardAlerts.map((alert, index) => {
              const isCompleted =
                alertStatuses[alert.AlertID] ?? alert.isCompleted;
              const isUpdating = Boolean(isUpdatingStatus[alert.AlertID]);
              const address = getAddress(alert);

              return (
                <article
                  key={`${alert.AlertID}-${index}`}
                  className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <p className="text-sm font-semibold text-gray-900">
                    #{alert.AlertID}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleAlertStatus(alert.AlertID)}
                    disabled={isUpdating}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors duration-200 ${
                      isUpdating
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    } ${
                      isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {isUpdating
                      ? "Updating..."
                      : isCompleted
                        ? "Completed"
                        : "Ongoing"}
                  </button>
                </div>

                <div className="flex flex-1 items-start justify-between gap-4 border-b border-gray-200 pb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Current Location:
                    </p>
                    <p className="text-sm leading-6 text-gray-700">{address}</p>
                  </div>
                  <MiniMap
                    latitude={alert.Latitude}
                    longitude={alert.Longitude}
                    onClick={() => handleViewLocation(alert)}
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name:
                    </p>
                    {getVictimName(alert) ? (
                      <p className="font-semibold text-gray-900">
                        {getVictimName(alert)}
                      </p>
                    ) : (
                      <span className="inline-block h-[1em] w-[10ch] rounded bg-gray-200 align-middle skeleton-shimmer" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Alert Time:
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatAlertTime(alert.AlertTime)}
                    </p>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setIsInfoModalOpen(true);
                    }}
                    className={`flex h-10 items-center justify-center cursor-pointer rounded-lg bg-[#D5FF9E] px-4 text-sm font-semibold hover:bg-[#BEEA7A] ${
                      isCompleted ? "flex-1" : "w-full"
                    }`}
                  >
                    View Information
                  </button>
                  {isCompleted && (
                    <button
                      type="button"
                      onClick={() => openDeleteConfirmation(alert.AlertID)}
                      aria-label={`Delete alert ${alert.AlertID}`}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`alert-skeleton-${index}`}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="h-4 w-16 rounded bg-gray-200 skeleton-shimmer" />
                    <div className="h-6 w-20 rounded bg-gray-200 skeleton-shimmer" />
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3">
                  <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-gray-200 skeleton-shimmer" />
                      <div className="h-4 w-full rounded bg-gray-200 skeleton-shimmer" />
                  </div>
                    <div className="h-16 w-20 rounded bg-gray-200 skeleton-shimmer" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-200 skeleton-shimmer" />
                      <div className="h-4 w-28 rounded bg-gray-200 skeleton-shimmer" />
                  </div>
                  <div className="space-y-2 text-right">
                      <div className="ml-auto h-3 w-20 rounded bg-gray-200 skeleton-shimmer" />
                      <div className="ml-auto h-4 w-24 rounded bg-gray-200 skeleton-shimmer" />
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-1">
                    <div className="h-10 w-full rounded bg-gray-200 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {(
                    [
                      { label: "Alert ID", field: "id" },
                      { label: "Name", field: "victimId" },
                      { label: "Alert Time", field: "alertTime" },
                      { label: "Location", field: "location" },
                      { label: "Status", field: "status" },
                    ] as { label: string; field: SortField }[]
                  ).map(({ label, field }) => (
                    <th
                      key={field}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(field)}
                        className="inline-flex cursor-pointer items-center gap-1 hover:text-gray-900"
                      >
                        {label}
                        {getSortIcon(field)}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {listAlerts.map((alert, index) => {
                  const isCompleted =
                    alertStatuses[alert.AlertID] ?? alert.isCompleted;
                  const victimName = getVictimName(alert);

                  return (
                    <tr key={`${alert.AlertID}-${index}`}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        #{alert.AlertID}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800">
                        {victimName ? (
                          victimName
                        ) : (
                          <span className="inline-block h-[1em] w-[10ch] rounded bg-gray-200 align-middle skeleton-shimmer" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {formatAlertTime(alert.AlertTime)}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-sm leading-5 text-gray-700">
                        {geocodedAddresses[
                          `${alert.Latitude},${alert.Longitude}`
                        ] ? (
                          <p
                            className="truncate"
                            title={getAddress(alert)}
                          >
                            {getAddress(alert)}
                          </p>
                        ) : (
                          <div className="h-4 w-48 rounded bg-gray-200 skeleton-shimmer" />
                        )}
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
                          aria-label={`Open options for alert ${alert.AlertID}`}
                          onClick={(e) =>
                            toggleOptionsMenu(alert.AlertID, e.currentTarget)
                          }
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
                style={{
                  top: openOptionsMenu.top,
                  left: openOptionsMenu.left,
                }}
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
                    handleViewLocation(menuAlert);
                    setOpenOptionsMenu(null);
                  }}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                >
                  View Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleAlertStatus(menuAlert.AlertID);
                    setOpenOptionsMenu(null);
                  }}
                  disabled={Boolean(isUpdatingStatus[menuAlert.AlertID])}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm text-gray-800 transition-colors ${
                    isUpdatingStatus[menuAlert.AlertID]
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-gray-100"
                  }`}
                >
                  {isUpdatingStatus[menuAlert.AlertID]
                    ? "Updating..."
                    : "Change Status"}
                </button>
                {menuAlertIsCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      openDeleteConfirmation(menuAlert.AlertID);
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
        address={selectedAlert ? getAddress(selectedAlert) : null}
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
            style={{
              top: filterPopoverPosition.top,
              left: filterPopoverPosition.left,
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Filter Alerts
              </h3>
              <button
                type="button"
                onClick={clearFilter}
                className="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-[#3F8EFC] transition-colors hover:bg-blue-50"
              >
                Clear
              </button>
            </div>

            <div className="space-y-1">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "ongoing", label: "Ongoing" },
                  { value: "completed", label: "Completed" },
                ] as { value: StatusFilter; label: string }[]
              ).map(({ value, label }) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="statusFilter"
                    value={value}
                    checked={draftFilter === value}
                    onChange={() => setDraftFilter(value)}
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
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
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Alert
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete alert
              {pendingDeleteAlert && (
                <>
                  {" "}
                  <span className="font-semibold">
                    #{pendingDeleteAlert.AlertID}
                  </span>{" "}
                  for victim{" "}
                  <span className="font-semibold">
                    {getVictimName(pendingDeleteAlert)}
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
                disabled={isDeleting}
                className="min-w-28 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-70 w-full max-w-xs"
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