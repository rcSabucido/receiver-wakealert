import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { defaultIcon } from "../lib/leafletIcon";

type AlertItem = {
  id: number;
  firstName: string;
  lastName: string;
  latitude: string;
  longitude: string;
  alertTime: string;
  isCompleted: boolean;
};

type Props = {
  alerts: AlertItem[];
  focusedId: number | null;
  onMarkerClick?: (alert: AlertItem) => void;
};

// Helper component to pan/zoom the map when focusedId changes
function FlyToAlert({
  alerts,
  focusedId,
}: {
  alerts: AlertItem[];
  focusedId: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (focusedId === null) return;
    const target = alerts.find((a) => a.id === focusedId);
    if (!target) return;
    map.flyTo(
      [parseFloat(target.latitude), parseFloat(target.longitude)],
      15,
      { duration: 1.2 }
    );
  }, [focusedId, alerts, map]);

  return null;
}

export function MapView({ alerts, focusedId, onMarkerClick }: Props) {
  // Center on first alert (or a default)
  const center: [number, number] = alerts.length
    ? [parseFloat(alerts[0].latitude), parseFloat(alerts[0].longitude)]
    : [14.5995, 120.9842]; // Manila default

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {alerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[parseFloat(alert.latitude), parseFloat(alert.longitude)]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(alert),
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">
                #{alert.id} — {alert.firstName} {alert.lastName}
              </p>
              <p>{alert.alertTime}</p>
              <p
                className={
                  alert.isCompleted ? "text-green-600" : "text-red-600"
                }
              >
                {alert.isCompleted ? "Completed" : "Ongoing"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      <FlyToAlert alerts={alerts} focusedId={focusedId} />
    </MapContainer>
  );
}