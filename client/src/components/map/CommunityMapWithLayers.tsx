import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { CityPopupCard } from './CityPopupCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { safeDateFormat } from '@/lib/safeDateFormat';
import { Calendar, MapPin } from 'lucide-react';

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
  title?: string;
  eventType?: string;
  startDate?: any;
  address?: string;
}

interface MapLayer {
  id: string;
  label: string;
  enabled: any;
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

// Event-specific popup card
function EventPopupCard({ location }: { location: CommunityLocation }) {
  return (
    <div className="w-[280px] max-w-[280px] overflow-hidden rounded-lg bg-card flex flex-col p-4 space-y-3" data-testid={`popup-event-card-${location.id}`}>
      <h3 className="text-lg font-semibold leading-tight">{location.title || 'Event'}</h3>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            {location.startDate ? safeDateFormat(new Date(location.startDate), "EEE, MMM d, yyyy h:mm a") : "Date TBD"}
          </span>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs">{location.address || location.city}</span>
        </div>
      </div>

      <Link href={`/events/${location.id}`} className="block">
        <Button className="w-full text-xs" data-testid={`button-view-event-${location.id}`}>
          View Details
        </Button>
      </Link>
    </div>
  );
}

export function CommunityMapWithLayers({
  locations,
  layers,
  center,
  zoom,
  onCityClick,
}: CommunityMapWithLayersProps) {
  // Filter to only valid coordinates
  const displayMarkers = locations.filter(loc => {
    const lat = loc.coordinates?.lat;
    const lng = loc.coordinates?.lng;
    return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
  });

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

      {displayMarkers.map((location) => (
        <Marker
          key={`marker-${location.id}`}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={createLayerIcon()}
          eventHandlers={{
            click: () => onCityClick(location)
          }}
        >
          <Popup>
            {location.title ? (
              <EventPopupCard location={location} />
            ) : (
              <CityPopupCard
                city={location.city}
                country={location.country}
                groupId={location.groupId}
                memberCount={location.memberCount}
                eventCount={location.activeEvents}
                recommendationCount={location.recommendations}
                housingCount={location.housing}
              />
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
