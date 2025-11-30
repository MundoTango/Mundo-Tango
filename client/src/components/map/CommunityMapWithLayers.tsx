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

const createLayerIcon = (count: number, layerType: string) => {
  const colors = {
    events: { primary: '#FF6B6B', secondary: '#FF8E8E' },
    housing: { primary: '#4ECDC4', secondary: '#45B7AF' },
    recommendations: { primary: '#FFD93D', secondary: '#FFC107' },
    default: { primary: '#40E0D0', secondary: '#1E90FF' },
  };

  const colorPair = colors[layerType as keyof typeof colors] || colors.default;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${colorPair.primary} 0%, ${colorPair.secondary} 100%);
        border: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(64, 224, 208, 0.4);
        transition: transform 0.2s;
      ">
        ${count}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
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
          icon={createLayerIcon(location.memberCount, 'default')}
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
          icon={createLayerIcon(location.activeEvents, 'events')}
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
          icon={createLayerIcon(location.housing, 'housing')}
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
          icon={createLayerIcon(location.recommendations, 'recommendations')}
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
