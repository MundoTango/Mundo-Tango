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
  type?: 'event' | 'housing' | 'recommendation' | 'city';
  price?: number;
  category?: string;
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
  }, [center]);
  return null;
}

const PIN_CONFIG = {
  event: { bg: '#FF5A5F', shadow: 'rgba(255, 90, 95, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><rect x="3" y="4" width="18" height="18" rx="2" stroke="white" stroke-width="2" fill="none"/><line x1="8" y1="2" x2="8" y2="6" stroke="white" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="white" stroke-width="2"/></svg>' },
  housing: { bg: '#00A699', shadow: 'rgba(0, 166, 153, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M3 12l9-9 9 9M5 10v10h14V10" stroke="white" stroke-width="2" fill="none"/></svg>' },
  recommendation: { bg: '#FFB400', shadow: 'rgba(255, 180, 0, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="white"/></svg>' },
  city: { bg: '#0066FF', shadow: 'rgba(0, 102, 255, 0.4)', svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 2C8 2 5 5.5 5 9.5c0 5.5 7 12.5 7 12.5s7-7 7-12.5C19 5.5 16 2 12 2z" fill="white"/><circle cx="12" cy="9" r="2.5" fill="#0066FF"/></svg>' },
};

const createLayerIcon = (type?: 'event' | 'housing' | 'recommendation' | 'city', price?: number) => {
  const config = PIN_CONFIG[type || 'city'];
  
  // For housing with valid price, show price pill
  if (type === 'housing' && typeof price === 'number' && price >= 0) {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${config.bg};
          color: white;
          border-radius: 16px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 12px ${config.shadow};
          transition: transform 0.2s;
        ">
          ${price > 0 ? `$${price}` : 'Free'}
        </div>
      `,
      iconSize: [60, 28],
      iconAnchor: [30, 14],
    });
  }
  
  // For housing without price, show icon instead
  // Use outer container for proper positioning with pointer/drop pin shape
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 42px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          background: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px ${config.shadow};
          transition: transform 0.2s;
        ">
          <div style="
            background: ${config.bg};
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${config.svg}
          </div>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid white;
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
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

// Housing-specific popup card
function HousingPopupCard({ location }: { location: CommunityLocation }) {
  return (
    <div className="w-[280px] max-w-[280px] overflow-hidden rounded-lg bg-card flex flex-col p-4 space-y-3" data-testid={`popup-housing-card-${location.id}`}>
      <h3 className="text-lg font-semibold leading-tight">{location.title || 'Housing'}</h3>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs">{location.city}{location.country ? `, ${location.country}` : ''}</span>
        </div>
        {typeof location.price === 'number' && (
          <div className="font-semibold text-foreground">
            {location.price > 0 ? `$${location.price}/night` : 'Free'}
          </div>
        )}
      </div>

      <Link href={`/housing/listing/${location.id}`} className="block">
        <Button className="w-full text-xs" data-testid={`button-view-housing-${location.id}`}>
          View Details
        </Button>
      </Link>
    </div>
  );
}

// Recommendation-specific popup card
function RecommendationPopupCard({ location }: { location: CommunityLocation }) {
  return (
    <div className="w-[280px] max-w-[280px] overflow-hidden rounded-lg bg-card flex flex-col p-4 space-y-3" data-testid={`popup-rec-card-${location.id}`}>
      <h3 className="text-lg font-semibold leading-tight">{location.title || 'Recommendation'}</h3>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        {location.category && (
          <span className="inline-block px-2 py-1 text-xs bg-primary/10 rounded">{location.category}</span>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs">{location.address || location.city}</span>
        </div>
      </div>

      <Link href={`/recommendations/${location.id}`} className="block">
        <Button className="w-full text-xs" data-testid={`button-view-rec-${location.id}`}>
          View Details
        </Button>
      </Link>
    </div>
  );
}

// Get popup component based on location type
function LocationPopupCard({ location }: { location: CommunityLocation }) {
  // Explicit type matching
  if (location.type === 'event') {
    return <EventPopupCard location={location} />;
  }
  if (location.type === 'housing') {
    return <HousingPopupCard location={location} />;
  }
  if (location.type === 'recommendation') {
    return <RecommendationPopupCard location={location} />;
  }
  
  // Legacy fallback: if has title but no type, treat as event (backward compatibility)
  if (location.title && !location.type) {
    return <EventPopupCard location={location} />;
  }
  
  // Default: city popup for type='city' or no type with no title
  return (
    <CityPopupCard
      city={location.city}
      country={location.country}
      groupId={location.groupId}
      memberCount={location.memberCount}
      eventCount={location.activeEvents}
      recommendationCount={location.recommendations}
      housingCount={location.housing}
    />
  );
}

export function CommunityMapWithLayers({
  locations,
  layers,
  center,
  zoom,
  onCityClick,
}: CommunityMapWithLayersProps) {
  // Build set of enabled layer IDs for filtering
  const enabledLayers = new Set(
    layers.filter(layer => layer.enabled).map(layer => layer.id)
  );
  
  // Filter to only valid coordinates and enabled layers
  const displayMarkers = locations.filter(loc => {
    const lat = loc.coordinates?.lat;
    const lng = loc.coordinates?.lng;
    const hasValidCoords = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    
    if (!hasValidCoords) return false;
    
    // If no layers specified, no enabled layers, or all enabled, show all markers
    if (layers.length === 0 || enabledLayers.size === 0 || enabledLayers.size === layers.length) return true;
    
    // Map location type to layer ID patterns (flexible matching)
    const locationType = loc.type || 'city';
    const layerPatterns: Record<string, RegExp> = {
      'event': /event/i,
      'housing': /housing|listing/i,
      'recommendation': /recommend/i,
      'city': /cit|group/i
    };
    
    const pattern = layerPatterns[locationType];
    if (!pattern) return true; // Unknown types show by default
    
    // Check if any enabled layer matches the pattern
    return Array.from(enabledLayers).some(layerId => pattern.test(layerId));
  });

  // World bounds to prevent infinite scrolling - limit to one world view
  const worldBounds: L.LatLngBoundsExpression = [
    [-85, -180], // Southwest corner
    [85, 180]    // Northeast corner
  ];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-b-lg"
      maxBounds={worldBounds}
      maxBoundsViscosity={1.0}
      minZoom={2}
      worldCopyJump={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        noWrap={true}
      />
      <MapUpdater center={center} />

      {displayMarkers.map((location) => (
        <Marker
          key={`marker-${location.type || 'loc'}-${location.id}`}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={createLayerIcon(location.type, location.type === 'housing' ? location.price : undefined)}
        >
          <Popup className="event-map-popup" offset={[0, -10]}>
            <LocationPopupCard location={location} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
