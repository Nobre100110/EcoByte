import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrigir ícone padrão do Leaflet
const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  shadowSize: [41, 41],
  iconAnchor: [12, 41],
  shadowAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 47],
  shadowSize: [41, 41],
  iconAnchor: [15, 47],
  shadowAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapViewProps {
  points: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    addr: string;
    hours: string;
    phone: string;
  }>;
  userLocation?: { lat: number; lng: number };
  center?: { lat: number; lng: number };
  onSelectPoint?: (point: any) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  points,
  userLocation,
  center = { lat: -3.728, lng: -38.5021 },
  onSelectPoint,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Invalidate size quando o componente monta ou a localização muda
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [userLocation]);

  return (
    // Ocupa 100% do espaço do pai — o pai (MapPage) controla a altura real
    <div className="w-full h-full">
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={13}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        zoomAnimation={true}
        inertia={true}
        inertiaDeceleration={3400}
        inertiaMaxSpeed={800}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador do usuário */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={greenIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold">📍 Sua Localização</p>
                <p className="text-xs text-gray-600">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de coleta */}
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onSelectPoint?.(point),
            }}
          >
            <Popup>
              <div className="w-64">
                <p className="font-bold text-sm mb-1">{point.name}</p>
                <p className="text-xs text-gray-600 mb-2">{point.addr}</p>
                <div className="flex items-center gap-1 text-xs mb-1">
                  <span>🕐 {point.hours}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <span>📞 {point.phone}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
