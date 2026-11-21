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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform text-white">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-cyan-700 transition-colors">
                BlindSpot
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-semibold">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">Tactical Travel Intelligence</p>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
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
                      ? 'bg-white text-cyan-800 border border-slate-200/90 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
                backendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-600">
              API {backendHealthy ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Phase 3 SerpApi Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs border-l border-slate-200 pl-3">
            <span
              className={`w-2 h-2 rounded-full ${
                serpApiStatus?.configured ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-600">
              SerpApi {serpApiStatus?.configured ? 'Live' : 'Pending'}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/investigate')}
            icon={Plus}
          >
            Investigate
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-4 space-y-2 animate-in fade-in duration-200 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `w-full px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-cyan-600" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Backend Status: {backendHealthy ? 'Online (HTTP 200)' : 'Offline'}
            </span>
            <Button
              size="sm"
              onClick={() => navigate('/investigate')}
              className="w-full mt-1"
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
