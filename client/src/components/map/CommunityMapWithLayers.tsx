import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { CityPopupCard } from './CityPopupCard';

interface CommunityLocation {
  id: number;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  memberCount: number;
  activeEvents: number;
  recommendations: number;
  housing: number;
  isActive: boolean;
  groupId?: number;
}

interface MapLayer {
  id: string;
  label: string;
  enabled: boolean;
  icon: any;
}

interface CommunityMapWithLayersProps {
  locations: CommunityLocation[];
  layers: MapLayer[];
  center: [number, number];
  zoom: number;
  onCityClick: (location: CommunityLocation) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const createLayerIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: #0066FF;
        border: 3px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.4);
        transition: transform 0.2s;
      ">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

export function CommunityMapWithLayers({
  locations,
  layers,
  center,
  zoom,
  onCityClick,
}: CommunityMapWithLayersProps) {
  const eventsEnabled = layers.find(l => l.id === 'events')?.enabled || false;
  const housingEnabled = layers.find(l => l.id === 'housing')?.enabled || false;
  const recommendationsEnabled = layers.find(l => l.id === 'recommendations')?.enabled || false;

  const noLayersEnabled = !eventsEnabled && !housingEnabled && !recommendationsEnabled;

  const eventMarkers = eventsEnabled ? locations.filter(loc => loc.activeEvents > 0) : [];
  const housingMarkers = housingEnabled ? locations.filter(loc => loc.housing > 0) : [];
  const recommendationMarkers = recommendationsEnabled ? locations.filter(loc => loc.recommendations > 0) : [];

  const defaultMarkers = noLayersEnabled ? locations : [];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-b-lg"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapUpdater center={center} />

      {defaultMarkers.map((location) => (
        <Marker
          key={`default-${location.id}`}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={createLayerIcon()}
          eventHandlers={{
            click: () => onCityClick(location)
          }}
        >
          <Popup>
            <CityPopupCard
              city={location.city}
              country={location.country}
              groupId={location.groupId}
              memberCount={location.memberCount}
              eventCount={location.activeEvents}
              recommendationCount={location.recommendations}
              housingCount={location.housing}
            />
          </Popup>
        </Marker>
      ))}

      {eventMarkers.map((location) => (
        <Marker
          key={`events-${location.id}`}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={createLayerIcon()}
          eventHandlers={{
            click: () => onCityClick(location)
          }}
        >
          <Popup>
            <CityPopupCard
              city={location.city}
              country={location.country}
              groupId={location.groupId}
              memberCount={location.memberCount}
              eventCount={location.activeEvents}
              recommendationCount={location.recommendations}
              housingCount={location.housing}
            />
          </Popup>
        </Marker>
      ))}

      {housingMarkers.map((location) => (
        <Marker
          key={`housing-${location.id}`}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={createLayerIcon()}
          eventHandlers={{
            click: () => onCityClick(location)
          }}
        >
          <Popup>
            <CityPopupCard
              city={location.city}
              country={location.country}
              groupId={location.groupId}
              memberCount={location.memberCount}
              eventCount={location.activeEvents}
              recommendationCount={location.recommendations}
              housingCount={location.housing}
            />
          </Popup>
        </Marker>
      ))}

      {recommendationMarkers.map((location) => (
        <Marker
          key={`recommendations-${location.id}`}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={createLayerIcon()}
          eventHandlers={{
            click: () => onCityClick(location)
          }}
        >
          <Popup>
            <CityPopupCard
              city={location.city}
              country={location.country}
              groupId={location.groupId}
              memberCount={location.memberCount}
              eventCount={location.activeEvents}
              recommendationCount={location.recommendations}
              housingCount={location.housing}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
