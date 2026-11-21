import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  Compass,
  LayoutDashboard,
  FileText,
  History,
  Search,
  Plus,
  ChevronDown,
  Sparkles,
  Radio,
  Shield,
  ShieldAlert,
  PanelLeftClose,
  PanelLeft,
  Check,
  Download,
  Share2,
  Bell,
  Menu,
  X,
  Activity,
  Layers,
  MapPin
} from 'lucide-react';
import healthService from '../../services/healthService';
import intelligenceService from '../../services/intelligenceService';
import { useInvestigation } from '../../context/InvestigationContext';

export const GlassAppShell = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentInvestigation, sampleDestinations, setCurrentInvestigation } = useInvestigation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [serpApiStatus, setSerpApiStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Backend Health & SerpApi Check
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const [resHealth, resSerp] = await Promise.allSettled([
          healthService.getHealth(),
          intelligenceService.getStatus(),
        ]);
        if (mounted) {
          if (resHealth.status === 'fulfilled' && resHealth.value?.data?.status === 'UP') {
            setBackendHealthy(true);
          }
          if (resSerp.status === 'fulfilled') {
            setSerpApiStatus(resSerp.value?.data);
          }
        }
      } catch (err) {
        // graceful fallback
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if query matches a sample destination
    const match = sampleDestinations.find(
      (d) =>
        d.city.toLowerCase().includes(q.toLowerCase()) ||
        d.country.toLowerCase().includes(q.toLowerCase())
    );

    if (match) {
      setCurrentInvestigation({
        id: `inv-${match.id}`,
        destinationId: match.id,
        destinationName: `${match.city}, ${match.country}`,
        dates: { start: '2026-12-05', end: '2026-12-14', days: 9 },
        travellerType: 'Independent Explorer',
        riskProfile: 'Balanced Caution',
        createdAt: new Date().toISOString(),
        awarenessIndex: match.awarenessIndex.overall,
        advisoryLevel: `Level ${match.advisory.level}: ${match.advisory.label}`,
        isSample: true,
        reportData: match,
      });
      navigate('/dashboard');
    } else {
      navigate(`/investigate?q=${encodeURIComponent(q)}`);
    }
  };

  const navLinks = [
    { to: '/', label: 'Explore', icon: Eye, end: true },
    { to: '/investigate', label: 'Investigate', icon: Compass },
    { to: '/dashboard', label: 'Activity & Grid', icon: LayoutDashboard, badge: '7' },
    { to: '/report', label: 'Dossier Report', icon: FileText },
    { to: '/history', label: 'History', icon: History },
  ];

  // Get current view title & subtitle
  const getHeaderMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Activity & Intelligence Grid',
          subtitle: `Real-time intelligence feed for ${currentInvestigation?.destinationName || 'Bogotá, Colombia'}.`,
        };
      case '/investigate':
        return {
          title: 'Investigation Configurator',
          subtitle: 'Specify destination parameters and traveler profile for localized telemetry.',
        };
      case '/report':
        return {
          title: 'Executive Intelligence Dossier',
          subtitle: 'Comprehensive printable briefing with verified ground corroborations.',
        };
      case '/history':
        return {
          title: 'Archived Investigations',
          subtitle: 'Locally persisted intelligence queries and historical risk scoring.',
        };
      case '/':
      default:
        return {
          title: 'Explore Destinations',
          subtitle: 'Search tactical travel intelligence and preview pre-investigated catalogs.',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed p-2 sm:p-4 lg:p-6 flex items-center justify-center font-sans antialiased text-slate-800"
      style={{
        backgroundImage: `url('/wallpaper-forest.jpg')`,
        backgroundColor: '#122619',
      }}
    >
      {/* Dark atmospheric backdrop glow */}
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] pointer-events-none -z-10" />

      {/* Floating Glassmorphic App Window (macOS / Substack Style) */}
      <div className="w-full max-w-[1600px] h-[95vh] rounded-[28px] border border-white/25 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col lg:flex-row backdrop-blur-3xl bg-slate-900/30">
        
        {/* ============================================================== */}
        {/* LEFT SIDEBAR: Translucent Dark Frosted Glass                   */}
        {/* ============================================================== */}
        <aside
          className={`${
            sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          } w-full bg-slate-950/45 backdrop-blur-2xl border-b lg:border-b-0 lg:border-r border-white/10 text-white p-5 flex flex-col justify-between flex-shrink-0 transition-all duration-300 z-30`}
        >
          {/* Top Branding & Window Controls */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <NavLink to="/" className="flex items-center gap-3 group min-w-0">
                {/* Glowing orange/amber rounded logo */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-base tracking-tight text-white group-hover:text-orange-400 transition-colors">
                        BlindSpot
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 border border-white/15 text-orange-300 font-mono font-semibold">
                        v2.0
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate">Travel Intelligence</p>
                  </div>
                )}
              </NavLink>

              {/* Sidebar Collapse Toggle (Desktop) */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation Menu List */}
            <nav className={`space-y-1.5 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-white/15 text-white border border-white/15 shadow-sm font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 flex-shrink-0 text-white/80 group-hover:text-white" />
                      {!sidebarCollapsed && <span className="truncate">{link.label}</span>}
                    </div>

                    {/* Orange counter badge matching the Substack Activity pill */}
                    {!sidebarCollapsed && link.badge && (
                      <span className="w-5 h-5 rounded-full bg-[#ff5a1f] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* Quick Orange Primary CTA Button (matches + Create ▾ in Substack mockup) */}
              <div className="pt-3">
                <button
                  onClick={() => navigate('/investigate')}
                  className="w-full bg-gradient-to-r from-[#ff5a1f] to-[#ff7a45] hover:from-[#ea4e15] hover:to-[#f96a30] text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                  title="Launch New Investigation"
                >
                  <Plus className="w-4 h-4" />
                  {!sidebarCollapsed && (
                    <>
                      <span>New Investigation</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-80 ml-auto" />
                    </>
                  )}
                </button>
              </div>
            </nav>
          </div>

          {/* Bottom Sidebar: System Telemetry & Profile */}
          <div className={`pt-4 border-t border-white/10 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            {!sidebarCollapsed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-white/60 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    API {backendHealthy ? 'Online' : 'Offline'}
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="text-cyan-300">
                    SerpApi {serpApiStatus?.configured ? 'Live' : 'Pending'}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xs">
                    BS
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-white block truncate">Tactical Explorer</span>
                    <span className="text-[10px] text-white/40 block truncate">Zero-Hallucination v2.0</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Systems Active" />
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT MAIN PANEL: Frosted Dark Tactical Glass                  */}
        {/* ============================================================== */}
        <main className="flex-1 bg-slate-950/75 backdrop-blur-2xl overflow-y-auto flex flex-col min-w-0 text-slate-100">
          {/* Top Bar (Matches Activity / Substack Header in High-Contrast Dark Glass) */}
          <header className="sticky top-0 z-20 bg-slate-950/70 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {headerMeta.title}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>

            {/* Top Right: Search Input with / Shortcut + Quick Action */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search destination (e.g. Bogotá)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded-xl text-white placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300 bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded shadow-2xs">
                  /
                </kbd>
              </form>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-xs flex items-center gap-1.5 flex-shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </header>

          {/* Substack-Style Horizontal Filter Tabs Bar */}
          <div className="px-6 py-2.5 bg-slate-950/50 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All', count: 7 },
                { id: 'advisories', label: 'Advisories & Alerts', count: 1 },
                { id: 'facilities', label: 'Emergency Facilities', count: 4 },
                { id: 'transit', label: 'Safe Corridors & Transit', count: 2 },
              ].map((tab) => {
                const isActive = activeFilterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/50 shadow-glow-cyan-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950 font-extrabold'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Live Telemetry Synced
              </span>
            </div>
          </div>

          {/* Render Active View Content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GlassAppShell;
