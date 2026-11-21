import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  Shield,
  Compass,
  LayoutDashboard,
  FileText,
  History,
  Menu,
  X,
  Activity,
  Plus
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import healthService from '../../services/healthService';
import intelligenceService from '../../services/intelligenceService';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [serpApiStatus, setSerpApiStatus] = useState(null);

  // Preserve Phase 1 Backend Health Check & Phase 3 SerpApi Status
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const [resHealth, resSerp] = await Promise.allSettled([
          healthService.getHealth(),
          intelligenceService.getStatus(),
        ]);

        if (mounted) {
          if (resHealth.status === 'fulfilled' && resHealth.value?.data?.status === 'UP') {
            setBackendHealthy(true);
          } else {
            setBackendHealthy(false);
          }

          if (resSerp.status === 'fulfilled') {
            setSerpApiStatus(resSerp.value?.data);
          }
        }
      } catch (err) {
        if (mounted) setBackendHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Explore', icon: Eye, end: true },
    { to: '/investigate', label: 'Investigate', icon: Compass },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report', label: 'Dossier Report', icon: FileText },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/85 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-glow-cyan-sm group-hover:scale-105 transition-transform">
            <Eye className="w-5 h-5 text-navy-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                BlindSpot
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-mono font-semibold">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Tactical Travel Intelligence</p>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-navy-900/60 p-1 rounded-xl border border-navy-800/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800/60'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Action & Status Group */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Phase 1 Backend Health Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-400">
              API {backendHealthy ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Phase 3 SerpApi Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs border-l border-navy-800 pl-3">
            <span
              className={`w-2 h-2 rounded-full ${
                serpApiStatus?.configured ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-400">
              SerpApi {serpApiStatus?.configured ? 'Live' : 'Pending'}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/investigate')}
            icon={Plus}
            className="shadow-glow-cyan-sm"
          >
            Investigate
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-navy-900 text-slate-300 hover:text-white border border-navy-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-800 px-4 py-4 space-y-2 animate-in fade-in duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Backend Status: {backendHealthy ? 'Online (HTTP 200)' : 'Offline'}
            </span>
            <Button
              size="sm"
              onClick={() => navigate('/investigate')}
              className="w-full mt-2"
            >
              Start Investigation
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
