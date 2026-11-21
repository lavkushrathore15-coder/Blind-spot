import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Hospital,
  Pill,
  Shield,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Compass,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
  Building,
  Info
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';
import locationService from '../../services/locationService';

export const EmergencyLocationIntelligence = ({ destinationName, className }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [radarActive, setRadarActive] = useState(true);

  const placeRefs = useRef({});

  // Fetch real Google Maps emergency locations
  const fetchLocations = async () => {
    if (!destinationName) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await locationService.getEmergencyLocations(destinationName);
      setData(res.data);
      if (res.data?.places?.length > 0) {
        setSelectedPlaceId(res.data.places[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve emergency locations from Google Maps.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [destinationName]);

  const copyPhone = (id, phone, e) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Filtered places list
  const filteredPlaces = useMemo(() => {
    if (!data?.places) return [];
    return data.places.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        searchFilter.trim() === '' ||
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [data?.places, selectedCategory, searchFilter]);

  // Places with valid GPS coordinates for map plotting
  const placesWithCoords = useMemo(() => {
    return filteredPlaces.filter((p) => p.hasValidCoordinates);
  }, [filteredPlaces]);

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    if (placesWithCoords.length === 0) return null;
    const lats = placesWithCoords.map((p) => p.coordinates.lat);
    const lngs = placesWithCoords.map((p) => p.coordinates.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = maxLat - minLat || 0.05;
    const lngSpan = maxLng - minLng || 0.05;

    return { minLat, maxLat, minLng, maxLng, latSpan, lngSpan };
  }, [placesWithCoords]);

  // Project GPS coordinates to relative percentage [x, y]
  const getCoordinatesPercent = (coords) => {
    if (!bounds || !coords) return { x: 50, y: 50 };
    const x = 10 + ((coords.lng - bounds.minLng) / bounds.lngSpan) * 80;
    // Invert latitude: higher lat is North (top)
    const y = 10 + ((bounds.maxLat - coords.lat) / bounds.latSpan) * 80;
    return {
      x: Math.min(92, Math.max(8, x)),
      y: Math.min(92, Math.max(8, y)),
    };
  };

  // Active selected place object
  const activePlace = useMemo(() => {
    if (!selectedPlaceId || !data?.places) return null;
    return data.places.find((p) => p.id === selectedPlaceId) || null;
  }, [selectedPlaceId, data?.places]);

  const handleSelectPlace = (placeId) => {
    setSelectedPlaceId(placeId);
    // Smooth scroll matching list card into view
    const el = placeRefs.current[placeId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'hospital':
        return {
          label: 'Hospital',
          badgeVariant: 'danger',
          pinBg: 'bg-rose-500 shadow-rose-500/50 border-rose-300',
          ringColor: 'bg-rose-500',
          textColor: 'text-rose-400',
          icon: Hospital,
        };
      case 'pharmacy':
        return {
          label: 'Pharmacy',
          badgeVariant: 'success',
          pinBg: 'bg-emerald-500 shadow-emerald-500/50 border-emerald-300',
          ringColor: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          icon: Pill,
        };
      case 'police':
        return {
          label: 'Police Station',
          badgeVariant: 'info',
          pinBg: 'bg-cyan-500 shadow-cyan-500/50 border-cyan-300',
          ringColor: 'bg-cyan-500',
          textColor: 'text-cyan-400',
          icon: Shield,
        };
      default:
        return {
          label: 'Emergency Facility',
          badgeVariant: 'neutral',
          pinBg: 'bg-cyan-500 shadow-cyan-500/50 border-cyan-300',
          ringColor: 'bg-cyan-500',
          textColor: 'text-cyan-400',
          icon: MapPin,
        };
    }
  };

  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-200/90 shadow-glass-light space-y-6 ${className || ''}`}>
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-200 text-cyan-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">Live Emergency & Location Intelligence</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-400 font-semibold">
                Google Maps Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified physical facilities for {destinationName || 'Destination'} (Hospitals, Pharmacies, Police)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchLocations}
            isLoading={isLoading}
            icon={RefreshCw}
          >
            Refresh Places
          </Button>
        </div>
      </div>

      {/* Prominent Truth-in-Data Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2.5 text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Facility Coverage Notice: </strong>
          Retrieved places reflect public Google Maps query results and do not represent every facility in the destination. Names, addresses, ratings, and phone numbers are displayed strictly when returned by the provider. Never invent emergency contacts.
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          type="danger"
          title="Location Retrieval Exception"
          message={error}
        >
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={fetchLocations}>
              Retry Query
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Grid: Interactive Map (Left) + Synchronized Places List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map Canvas (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
          {/* Map Controls Toolbar */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: `All (${data?.summary?.totalPlaces || 0})` },
                { id: 'hospital', label: `Hospitals (${data?.summary?.hospitalsCount || 0})`, icon: Hospital },
                { id: 'pharmacy', label: `Pharmacies (${data?.summary?.pharmaciesCount || 0})`, icon: Pill },
                { id: 'police', label: `Police (${data?.summary?.policeCount || 0})`, icon: Shield },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat.icon && <cat.icon className="w-3 h-3" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRadarActive(!radarActive)}
                className={`p-1 rounded ${radarActive ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
                title="Toggle Radar Grid"
              >
                <Radio className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Map Visual Area */}
          <div className="relative w-full h-[400px] sm:h-[460px] bg-[#070C18] overflow-hidden select-none">
            {isLoading && (
              <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                <Spinner size="lg" />
                <p className="text-xs text-cyan-300 font-mono animate-pulse font-semibold">
                  Querying live Google Maps emergency coordinates...
                </p>
              </div>
            )}

            {/* Radar Lines */}
            {radarActive && (
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-cyan-400" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-cyan-400" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent animate-radar-sweep origin-center" />
              </div>
            )}

            {/* Vector Coordinate Grid */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="emergency-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1E325F" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#emergency-grid)" />
            </svg>

            {/* Coordinate Bounds Overlay */}
            {bounds && (
              <div className="absolute top-3 left-3 z-10 font-mono text-[10px] text-slate-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                <span>GPS Grid: {bounds.minLat.toFixed(3)}°N to {bounds.maxLat.toFixed(3)}°N</span>
              </div>
            )}

            {/* Map Loading Failure / Empty Coordinates Overlay */}
            {!isLoading && placesWithCoords.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-950/80 backdrop-blur-xs space-y-2">
                <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  <MapPin className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">No Map Coordinates Available</h4>
                <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                  {error
                    ? error
                    : 'The retrieved facility listings for this location do not contain validated GPS coordinates to plot on the canvas.'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchLocations}
                  icon={RefreshCw}
                  className="mt-1"
                >
                  Retry Location Telemetry
                </Button>
              </div>
            )}

            {/* Clickable Map Markers */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              {placesWithCoords.map((place) => {
                const pos = getCoordinatesPercent(place.coordinates);
                const isSelected = selectedPlaceId === place.id;
                const theme = getCategoryTheme(place.category);
                const Icon = theme.icon;

                return (
                  <div
                    key={place.id}
                    style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                    onClick={() => handleSelectPlace(place.id)}
                  >
                    {/* Pulsing ring on selected */}
                    {isSelected && (
                      <span className={`absolute -inset-2.5 rounded-full opacity-70 animate-ping pointer-events-none ${theme.ringColor}`} />
                    )}

                    {/* Pin button */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform duration-200 group-hover:scale-125 ${
                        theme.pinBg
                      } ${isSelected ? 'ring-4 ring-cyan-400/60 scale-125' : ''}`}
                    >
                      <Icon className="w-3 h-3 text-white" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-slate-50/95 text-white text-[11px] font-medium py-1 px-2.5 rounded-md border border-slate-200 shadow-2xl pointer-events-none z-30">
                      <span>{place.title}</span>
                      {place.rating !== null && (
                        <span className="text-amber-300 font-mono ml-1.5">★ {place.rating}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Active Place Detail Card */}
            {activePlace && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:w-80 z-30 bg-slate-50/95 border border-cyan-500/50 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${getCategoryTheme(activePlace.category).ringColor}`} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      {getCategoryTheme(activePlace.category).label}
                    </span>
                  </div>
                  {activePlace.rating !== null && (
                    <span className="text-amber-300 font-mono font-bold text-[11px] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      {activePlace.rating} ({activePlace.reviews || 0})
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">{activePlace.title}</h4>

                <div className="space-y-1 text-[11px] text-slate-600">
                  {activePlace.address ? (
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{activePlace.address}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Address not listed</span>
                  )}

                  {activePlace.openState && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{activePlace.openState}</span>
                    </div>
                  )}

                  {activePlace.coordinates && (
                    <div className="text-[10px] font-mono text-slate-500">
                      GPS: {activePlace.coordinates.lat.toFixed(5)}, {activePlace.coordinates.lng.toFixed(5)}
                    </div>
                  )}
                </div>

                {activePlace.phone && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-semibold">{activePlace.phone}</span>
                    <button
                      onClick={(e) => copyPhone(activePlace.id, activePlace.phone, e)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] flex items-center gap-1 font-semibold"
                    >
                      {copiedPhoneId === activePlace.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Footer Bar */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hospitals
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pharmacies
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Police
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {placesWithCoords.length} plotted with verified GPS
            </span>
          </div>
        </div>

        {/* Synchronized List of Retrieved Places (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search Input for List */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter retrieved places by name or address..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Places Scrollable List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredPlaces.map((place) => {
              const isSelected = selectedPlaceId === place.id;
              const theme = getCategoryTheme(place.category);
              const Icon = theme.icon;

              return (
                <div
                  key={place.id}
                  ref={(el) => (placeRefs.current[place.id] = el)}
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 text-xs ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400/80 shadow-glow-cyan-sm'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-lg ${theme.pinBg} flex-shrink-0 mt-0.5`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-snug">{place.title}</h4>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {theme.label}
                        </span>
                      </div>
                    </div>

                    {place.rating !== null ? (
                      <span className="text-amber-300 font-mono font-bold text-xs flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        {place.rating}
                        <span className="text-[10px] text-slate-500 font-normal">({place.reviews})</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic flex-shrink-0">No rating</span>
                    )}
                  </div>

                  {/* Address */}
                  {place.address ? (
                    <div className="text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{place.address}</span>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Address not listed by provider</div>
                  )}

                  {/* Open Status & GPS badge */}
                  <div className="flex items-center gap-3 text-[11px] flex-wrap">
                    {place.openState && (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {place.openState}
                      </span>
                    )}
                    {place.hasValidCoordinates ? (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                        ✓ Verified GPS
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">No GPS coordinates</span>
                    )}
                  </div>

                  {/* Phone Bar */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    {place.phone ? (
                      <>
                        <div className="flex items-center gap-1.5 text-cyan-800 font-mono font-semibold">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          <span>{place.phone}</span>
                        </div>
                        <button
                          onClick={(e) => copyPhone(place.id, place.phone, e)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                        >
                          {copiedPhoneId === place.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">Phone number not listed</span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredPlaces.length === 0 && !isLoading && (
              <div className="glass-card rounded-xl p-8 text-center text-xs text-slate-500 space-y-2 border border-slate-200/90 shadow-glass-light">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                <h5 className="font-bold text-slate-900">No Matching Places Found</h5>
                <p>
                  No facilities matched the current category or search filter in {destinationName}. Try resetting the search or category filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyLocationIntelligence;
