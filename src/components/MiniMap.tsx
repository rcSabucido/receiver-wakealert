// src/components/MiniMap.tsx
import { getOsmTileUrl } from "../lib/osmTile";
import { MapPinIcon } from "@heroicons/react/24/solid";

type Props = {
  latitude: string;
  longitude: string;
  onClick?: () => void;
};

export function MiniMap({ latitude, longitude, onClick }: Props) {
  const tileUrl = getOsmTileUrl(latitude, longitude);

  return (
    <div
      onClick={onClick}
      title="View on map"
      className="relative h-12 w-12 shrink-0 cursor-pointer 
                 overflow-hidden rounded-md border border-gray-300"
    >
      <img
        src={tileUrl}
        alt="Map preview"
        draggable={false}
        className="h-full w-full object-cover"
      />
      {/* Center pin overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <MapPinIcon className="h-5 w-5 text-blue-500 drop-shadow-md" />
      </div>
    </div>
  );
}