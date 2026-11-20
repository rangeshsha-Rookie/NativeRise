// client/src/components/map/LiveTrackingMap.jsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom DivIcons for crisp styling matching our Fawn theme
const pickupIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `<div style="background-color: #A4542B; color: #FFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.3); border: 2px solid #FFF; font-weight: bold; font-size: 14px;">🏪</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const dropIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `<div style="background-color: #2F7D4F; color: #FFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.3); border: 2px solid #FFF; font-weight: bold; font-size: 14px;">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const partnerIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `<div style="background-color: #1E1712; color: #8DBBFA; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.4); border: 2px solid #8DBBFA; font-size: 18px;">🛵</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

function MapBoundsController({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const validPoints = points.filter((p) => p && !isNaN(p[0]) && !isNaN(p[1]));
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

export function LiveTrackingMap({
  pickup,
  drop,
  partnerLocation,
  trail = [],
  checkpoints = [],
  status
}) {
  const points = [];
  if (pickup?.lat && pickup?.lng) points.push([pickup.lat, pickup.lng]);
  if (drop?.lat && drop?.lng) points.push([drop.lat, drop.lng]);
  if (partnerLocation?.lat && partnerLocation?.lng) {
    points.push([partnerLocation.lat, partnerLocation.lng]);
  }

  const center = points.length > 0 ? points[0] : [19.2813, 72.8686];

  // Prepare trail line
  const polylineCoords = [];
  if (trail && trail.length > 0) {
    trail.forEach((pt) => {
      if (Array.isArray(pt)) polylineCoords.push(pt);
      else if (pt.lat && pt.lng) polylineCoords.push([pt.lat, pt.lng]);
    });
  } else if (pickup?.lat && drop?.lat) {
    // If no trail yet, show direct dashed line
    polylineCoords.push([pickup.lat, pickup.lng]);
    if (partnerLocation?.lat) polylineCoords.push([partnerLocation.lat, partnerLocation.lng]);
    polylineCoords.push([drop.lat, drop.lng]);
  }

  return (
    <div className="w-full h-80 sm:h-96 rounded-card overflow-hidden border border-line shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController points={points} />

        {/* Pickup Marker */}
        {pickup?.lat && pickup?.lng && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Pickup Shop</strong>
                <p>{pickup.line || 'Seller Location'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Drop Marker */}
        {drop?.lat && drop?.lng && (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Your Delivery Address</strong>
                <p>{drop.line || 'Customer Drop'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Partner Live Marker */}
        {partnerLocation?.lat && partnerLocation?.lng && status !== 'DELIVERED' && (
          <Marker
            position={[partnerLocation.lat, partnerLocation.lng]}
            icon={partnerIcon}
          >
            <Popup>
              <div className="text-xs">
                <strong>Delivery Partner</strong>
                <p>Live Location (moving to drop)</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Polyline Route */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#A4542B"
            weight={4}
            opacity={0.8}
            dashArray={trail?.length > 0 ? null : '6, 8'}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default LiveTrackingMap;
