import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { Users, Calendar, Home, Building2 } from 'lucide-react';

interface CommunityLocation {
  id: number;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  memberCount: number;
  activeEvents: number;
  venues: number;
  housing: number;
  recommendations: number;
  isActive: boolean;
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

// Create custom markers with different colors for each layer type
const createLayerIcon = (count: number, layerType: string) => {
  const colors = {
    events: { primary: '#FF6B6B', secondary: '#FF8E8E' }, // Red gradient for events
    housing: { primary: '#4ECDC4', secondary: '#45B7AF' }, // Teal gradient for housing
    recommendations: { primary: '#FFD93D', secondary: '#FFC107' }, // Yellow gradient for venues/recommendations
    default: { primary: '#40E0D0', secondary: '#1E90FF' }, // MT Ocean default
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
  // Find which layers are enabled
  const eventsEnabled = layers.find(l => l.id === 'events')?.enabled || false;
  const housingEnabled = layers.find(l => l.id === 'housing')?.enabled || false;
  const recommendationsEnabled = layers.find(l => l.id === 'recommendations')?.enabled || false;

  // If no layers are enabled, show default markers for all locations
  const noLayersEnabled = !eventsEnabled && !housingEnabled && !recommendationsEnabled;

  // Create marker sets for each enabled layer
  const eventMarkers = eventsEnabled ? locations.filter(loc => loc.activeEvents > 0) : [];
  const housingMarkers = housingEnabled ? locations.filter(loc => loc.housing > 0) : [];
  const recommendationMarkers = recommendationsEnabled ? locations.filter(loc => loc.recommendations > 0) : [];

  // For default display when no layers are enabled
  const defaultMarkers = noLayersEnabled ? locations : [];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-b-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapUpdater center={center} />

      {/* Default markers when no layers enabled */}
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
            <div className="p-2" data-testid={`popup-location-${location.id}`}>
              <h3 className="font-bold text-lg mb-2">{location.city}, {location.country}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{location.memberCount} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{location.activeEvents} events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>{location.housing} housing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{location.venues} venues</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Events layer markers (RED) */}
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
            <div className="p-2" data-testid={`popup-events-${location.id}`}>
              <h3 className="font-bold text-lg mb-2">{location.city}, {location.country}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{location.activeEvents} active events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{location.memberCount} members</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Housing layer markers (TEAL) */}
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
            <div className="p-2" data-testid={`popup-housing-${location.id}`}>
              <h3 className="font-bold text-lg mb-2">{location.city}, {location.country}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-teal-500" />
                  <span className="font-semibold">{location.housing} housing listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{location.memberCount} members</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Recommendations/Venues layer markers (YELLOW) */}
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
            <div className="p-2" data-testid={`popup-recommendations-${location.id}`}>
              <h3 className="font-bold text-lg mb-2">{location.city}, {location.country}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{location.recommendations} venue recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{location.memberCount} members</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
