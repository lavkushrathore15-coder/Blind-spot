import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import {
  MapPin,
  Shield,
  Hospital,
  AlertTriangle,
  Building,
  Navigation,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Phone,
  Layers,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Star,
  Clock,
  Pill,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import locationService from '../../services/locationService';

/**
 * Creates custom tactical glowing HTML marker icons for Leaflet
 */
const createTacticalPinIcon = (category, isSelected = false) => {
  const colorMap = {
    hospital: { bg: '#f43f5e', border: '#fda4af', shadow: 'rgba(244, 63, 94, 0.55)', icon: '🏥' },
    pharmacy: { bg: '#10b981', border: '#6ee7b7', shadow: 'rgba(16, 185, 129, 0.55)', icon: '💊' },
    police: { bg: '#06b6d4', border: '#67e8f9', shadow: 'rgba(6, 182, 212, 0.55)', icon: '🛡️' },
    embassy: { bg: '#8b5cf6', border: '#c4b5fd', shadow: 'rgba(139, 92, 246, 0.55)', icon: '🏛️' },
    transit: { bg: '#6366f1', border: '#a5b4fc', shadow: 'rgba(99, 102, 241, 0.55)', icon: '🚆' },
    'safe-haven': { bg: '#10b981', border: '#6ee7b7', shadow: 'rgba(16, 185, 129, 0.55)', icon: '✓' },
    caution: { bg: '#f59e0b', border: '#fcd34d', shadow: 'rgba(245, 158, 11, 0.55)', icon: '⚠️' },
  };

  const theme = colorMap[category] || colorMap.police;
  const size = isSelected ? 30 : 24;

  return L.divIcon({
    className: 'blindspot-tactical-pin-wrapper',
    html: `
      <div class="blindspot-marker-pin" style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          background: ${theme.shadow};
          opacity: 0.4;
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></span>
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 9999px;
          background: ${theme.bg};
          border: 1.5px solid ${theme.border};
          box-shadow: 0 2px 10px ${theme.shadow};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${size > 26 ? '13px' : '11px'};
          line-height: 1;
          cursor: pointer;
        ">
          ${theme.icon}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
};

/**
 * Controller to handle map invalidation, auto-fitting to place markers, and center changes
 */
function MapController({ center, zoom, bounds, targetDestination, selectedFilter, onMapReady }) {
  const map = useMap();
  const fittedBoundsKeyRef = useRef(null);

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      const boundsKey = `${targetDestination}-${selectedFilter}-${bounds.getNorthEast().toString()}-${bounds.getSouthWest().toString()}`;
      if (fittedBoundsKeyRef.current !== boundsKey) {
        fittedBoundsKeyRef.current = boundsKey;
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true, duration: 1 });
      }
    } else if (center && center[0] != null && center[1] != null && !fittedBoundsKeyRef.current) {
      map.flyTo(center, zoom || 13, { duration: 1 });
    }
  }, [bounds, center, zoom, map, targetDestination, selectedFilter]);

  return null;
}

/**
 * Minimal Marker Popup: Contains ONLY Location name, Category, and Address.
 * Shows additional details only when explicitly requested.
 */
function MarkerPopupContent({ place, onCopyPhone, copiedPhoneId }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-3 space-y-2 text-slate-200 min-w-[200px]">
      {/* Location name and Category */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-semibold text-white leading-snug break-words flex-1">
          {place.title}
        </h4>
        <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-navy-800 text-cyan-400 border border-navy-700 flex-shrink-0">
          {place.category}
        </span>
      </div>

      {/* Address (if available) */}
      {place.address && (
        <p className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1">
          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="break-words">{place.address}</span>
        </p>
      )}

      {/* Additional details only when explicitly requested */}
      {(place.phone || place.rating != null || place.openState) && (
        <div className="pt-1.5 border-t border-navy-800">
          {!showDetails ? (
            <button
              onClick={() => setShowDetails(true)}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          ) : (
            <div className="space-y-1.5 pt-1 text-[11px] animate-in fade-in">
              {place.phone && (
                <div className="flex items-center justify-between text-cyan-300 font-mono">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" />
                    {place.phone}
                  </span>
                  <button
                    onClick={(e) => onCopyPhone(place.id, place.phone, e)}
                    className="p-0.5 text-slate-400 hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copiedPhoneId === place.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {place.rating != null && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{place.rating}</span>
                  {place.reviews != null && (
                    <span className="text-slate-500">({place.reviews})</span>
                  )}
                </div>
              )}

              {place.openState && (
                <div className="flex items-center gap-1 text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>{place.openState}</span>
                </div>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${place.title} ${place.address || ''}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 w-full py-1 px-2 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <span>Directions</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const InteractiveMapArea = ({ destination, destinationName, className }) => {
  const targetDestination = useMemo(() => {
    if (destinationName && destinationName.trim()) return destinationName.trim();
    if (destination?.city) {
      return `${destination.city}${destination.country ? `, ${destination.country}` : ''}`;
    }
    return 'Destination';
  }, [destinationName, destination]);

  // Map state
  const [mapInstance, setMapInstance] = useState(null);
  const [tileLayerType, setTileLayerType] = useState('dark'); // 'dark' | 'street'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activePin, setActivePin] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);

  // Data fetching state
  const [places, setPlaces] = useState([]);
  const [apiCenterCoords, setApiCenterCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch actual locations via SerpApi Google Maps
  const fetchMapLocations = async () => {
    if (!targetDestination || targetDestination === 'Destination') return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await locationService.getEmergencyLocations(targetDestination, 'all');
      if (res?.data) {
        const rawPlaces = res.data.places || [];
        setPlaces(rawPlaces);
        if (res.data.centerCoordinates) {
          setApiCenterCoords(res.data.centerCoordinates);
        }
      }
    } catch (err) {
      console.warn('[InteractiveMapArea] Location fetch notice:', err);
      setErrorMessage(
        err.message || 'Unable to load real-time map points.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapLocations();
  }, [targetDestination]);

  // Combine SerpApi places with verified destination coordinates
  const allVerifiedPlaces = useMemo(() => {
    const combined = [...places];

    if (Array.isArray(destination?.emergencyFacilities)) {
      destination.emergencyFacilities.forEach((fac) => {
        if (fac.coordinates && fac.coordinates.lat && fac.coordinates.lng) {
          const exists = combined.some(
            (p) => p.title?.toLowerCase() === fac.name?.toLowerCase()
          );
          if (!exists) {
            combined.push({
              id: fac.id,
              title: fac.name,
              category: fac.category || 'hospital',
              address: fac.address,
              phone: fac.phone,
              hours: fac.hours,
              coordinates: fac.coordinates,
              hasValidCoordinates: true,
            });
          }
        }
      });
    }

    if (Array.isArray(destination?.neighborhoods)) {
      destination.neighborhoods.forEach((n, idx) => {
        if (n.coordinates && n.coordinates.lat && n.coordinates.lng) {
          combined.push({
            id: `neigh-${idx}`,
            title: n.name,
            category: n.tier === 'Safe Haven' ? 'safe-haven' : 'caution',
            address: n.notes,
            coordinates: n.coordinates,
            hasValidCoordinates: true,
          });
        }
      });
    }

    return combined;
  }, [places, destination]);

  // Filter only places with validated coordinates
  const placesWithCoords = useMemo(() => {
    return allVerifiedPlaces.filter(
      (p) =>
        p.coordinates &&
        p.coordinates.lat != null &&
        p.coordinates.lng != null &&
        !isNaN(p.coordinates.lat) &&
        !isNaN(p.coordinates.lng)
    );
  }, [allVerifiedPlaces]);

  // Available categories strictly matching user list
  const availableCategories = useMemo(() => {
    const counts = {
      hospital: 0,
      embassy: 0,
      'safe-haven': 0,
      caution: 0,
      transit: 0,
      police: 0,
      pharmacy: 0,
    };

    placesWithCoords.forEach((p) => {
      const cat = p.category?.toLowerCase();
      if (counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    const catDefs = [
      { id: 'all', label: 'All', count: placesWithCoords.length, icon: Layers },
      { id: 'hospital', label: 'Hospitals', count: counts.hospital, icon: Hospital },
      { id: 'embassy', label: 'Embassies', count: counts.embassy, icon: Building },
      { id: 'safe-haven', label: 'Safe Havens', count: counts['safe-haven'], icon: ShieldCheck },
      { id: 'caution', label: 'Caution Zones', count: counts.caution, icon: AlertTriangle },
      { id: 'transit', label: 'Transit', count: counts.transit, icon: Navigation },
      { id: 'police', label: 'Police', count: counts.police, icon: Shield },
      { id: 'pharmacy', label: 'Pharmacies', count: counts.pharmacy, icon: Pill },
    ];

    return catDefs.filter((cat) => cat.id === 'all' || cat.count > 0);
  }, [placesWithCoords]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return placesWithCoords.filter((p) => {
      return selectedFilter === 'all' || p.category?.toLowerCase() === selectedFilter;
    });
  }, [placesWithCoords, selectedFilter]);

  // Compute map center coordinate
  const mapCenter = useMemo(() => {
    if (placesWithCoords.length > 0) {
      const avgLat =
        placesWithCoords.reduce((acc, p) => acc + Number(p.coordinates.lat), 0) /
        placesWithCoords.length;
      const avgLng =
        placesWithCoords.reduce((acc, p) => acc + Number(p.coordinates.lng), 0) /
        placesWithCoords.length;
      return [avgLat, avgLng];
    }
    if (
      destination?.coords?.lat != null &&
      destination?.coords?.lng != null &&
      destination.coords.lat !== 20.5937
    ) {
      return [destination.coords.lat, destination.coords.lng];
    }
    if (apiCenterCoords?.lat != null && apiCenterCoords?.lng != null) {
      return [apiCenterCoords.lat, apiCenterCoords.lng];
    }
    if (destination?.coords?.lat != null && destination?.coords?.lng != null) {
      return [destination.coords.lat, destination.coords.lng];
    }
    return [20.5937, 78.9629];
  }, [placesWithCoords, destination?.coords, apiCenterCoords]);

  // Compute LatLngBounds to fit all markers
  const mapBounds = useMemo(() => {
    if (filteredPlaces.length === 0) return null;
    try {
      const latLngs = filteredPlaces.map((p) => [p.coordinates.lat, p.coordinates.lng]);
      return L.latLngBounds(latLngs);
    } catch {
      return null;
    }
  }, [filteredPlaces]);

  // Telemetry coordinates readout string
  const coordsLabel = useMemo(() => {
    const lat = destination?.coords?.lat ?? mapCenter[0];
    const lng = destination?.coords?.lng ?? mapCenter[1];
    if (lat != null && lng != null) {
      const latStr = `${Math.abs(Number(lat)).toFixed(4)}° ${Number(lat) >= 0 ? 'N' : 'S'}`;
      const lngStr = `${Math.abs(Number(lng)).toFixed(4)}° ${Number(lng) >= 0 ? 'E' : 'W'}`;
      return `${latStr}, ${lngStr}`;
    }
    return '';
  }, [destination?.coords, mapCenter]);

  // Copy phone helper
  const handleCopyPhone = (id, phone, e) => {
    if (e) e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Reset map view
  const handleResetView = () => {
    if (!mapInstance) return;
    if (mapBounds && mapBounds.isValid()) {
      mapInstance.fitBounds(mapBounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      mapInstance.flyTo(mapCenter, 13, { duration: 1 });
    }
  };

  return (
    <div className={`glass-card rounded-2xl overflow-hidden border border-navy-750/70 flex flex-col shadow-xl ${className || ''}`}>
      {/* 1. Header: Title, Destination & Coordinates */}
      <div className="px-4 py-3 bg-navy-900/90 border-b border-navy-750/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Tactical Security & Facility Grid
          </h3>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-xs font-medium text-slate-300">
            {targetDestination}
          </span>
          {coordsLabel && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-navy-800/90 border border-navy-700/80 text-cyan-400">
              {coordsLabel}
            </span>
          )}
        </div>

        {/* Minimal Tile Switch & Refresh */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center bg-navy-950 p-0.5 rounded-lg border border-navy-800 text-xs">
            <button
              onClick={() => setTileLayerType('dark')}
              className={`px-2 py-0.5 rounded transition-all text-[11px] font-medium ${
                tileLayerType === 'dark'
                  ? 'bg-cyan-500 text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileLayerType('street')}
              className={`px-2 py-0.5 rounded transition-all text-[11px] font-medium ${
                tileLayerType === 'street'
                  ? 'bg-cyan-500 text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Street
            </button>
          </div>

          <button
            onClick={fetchMapLocations}
            disabled={isLoading}
            className="p-1 rounded-lg bg-navy-850 border border-navy-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Filters: One Clean Horizontal Row */}
      <div className="px-4 py-2 bg-navy-950/80 border-b border-navy-800 flex items-center gap-1.5 overflow-x-auto">
        {availableCategories.map((filter) => {
          const Icon = filter.icon;
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => {
                setSelectedFilter(filter.id);
                setActivePin(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-cyan-500 text-navy-950 font-semibold'
                  : 'bg-navy-900/80 text-slate-300 hover:text-white hover:bg-navy-850 border border-navy-800'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span>{filter.label}</span>
              {filter.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-navy-950/20 text-navy-950 font-bold'
                      : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  {filter.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Center Map: Maximized Visual Space */}
      <div className="relative w-full h-[580px] sm:h-[660px] lg:h-[720px] bg-[#070C18] overflow-hidden select-none">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-navy-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 gap-2 text-center animate-in fade-in">
            <div className="w-7 h-7 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">Loading map...</span>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && !isLoading && (
          <div className="absolute top-3 left-3 right-16 z-30 p-2 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-xl backdrop-blur-md">
            <span className="truncate">{errorMessage}</span>
            <button
              onClick={fetchMapLocations}
              className="px-2 py-0.5 rounded bg-rose-900 hover:bg-rose-800 text-white text-[11px] font-medium flex items-center gap-1 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Compact Vertical Map Controls (Top Right) */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1 bg-navy-900/90 backdrop-blur-md p-1 rounded-xl border border-navy-750/80 shadow-xl">
          <button
            onClick={() => mapInstance?.zoomIn()}
            className="w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 flex items-center justify-center transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            className="w-7 h-7 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="h-px bg-navy-750 my-0.5 mx-1" />
          <button
            onClick={handleResetView}
            className="w-7 h-7 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-navy-800 flex items-center justify-center transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* React Leaflet Map Canvas */}
        <MapContainer
          center={mapCenter}
          zoom={13}
          minZoom={3}
          maxZoom={19}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {tileLayerType === 'dark' ? (
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="dark-tactical-osm"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          ) : (
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          )}

          <MapController
            center={mapCenter}
            zoom={13}
            bounds={mapBounds}
            targetDestination={targetDestination}
            selectedFilter={selectedFilter}
            onMapReady={setMapInstance}
          />

          {filteredPlaces.map((place) => {
            const isSelected = activePin?.id === place.id;
            const cat = place.category?.toLowerCase() || 'police';
            const icon = createTacticalPinIcon(cat, isSelected);

            return (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => setActivePin(place),
                }}
              >
                <Popup className="blindspot-leaflet-popup" minWidth={220} maxWidth={280}>
                  <MarkerPopupContent
                    place={place}
                    onCopyPhone={handleCopyPhone}
                    copiedPhoneId={copiedPhoneId}
                  />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 4. Bottom: Small Category Legend with Coloured Indicators */}
      <div className="px-4 py-2 bg-navy-950/90 border-t border-navy-800/60 flex items-center justify-between text-xs text-slate-300 gap-3">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Hospitals
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-violet-500" /> Embassies
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Safe Havens
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Caution Zones
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Transit
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Police
          </span>
        </div>

        <div className="text-[10px] font-mono text-slate-400">
          &copy; OpenStreetMap
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapArea;
