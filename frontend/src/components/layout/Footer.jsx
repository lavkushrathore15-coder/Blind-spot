import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Eye, Heart, Globe, Lock, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-12 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">BlindSpot Intelligence</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Tactical travel risk intelligence uncovering what traditional guides omit. Built with privacy-first architecture, verified emergency facility mapping, and localized awareness indexing.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-cyan-800 inline-block font-mono">
              Notice: All data is designated sample intelligence for frontend verification.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Platform Views
            </span>
            <ul className="space-y-1.5">
              <li>
                <NavLink to="/" className="text-slate-600 hover:text-cyan-700 transition-colors">
                  Explore Destinations
                </NavLink>
              </li>
              <li>
                <NavLink to="/investigate" className="text-slate-600 hover:text-cyan-700 transition-colors">
                  Investigation Engine
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="text-slate-600 hover:text-cyan-700 transition-colors">
                  Tactical Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/report" className="text-slate-600 hover:text-cyan-700 transition-colors">
                  Intelligence Dossier
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" className="text-slate-600 hover:text-cyan-700 transition-colors">
                  Archived Investigations
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Architecture & Security */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Architecture
            </span>
            <ul className="space-y-1.5 text-slate-500 text-[11px] font-mono">
              <li>• React 18 + Vite</li>
              <li>• Frosted Glassmorphism Light Theme</li>
              <li>• Node.js + Express REST API</li>
              <li>• Live OpenWeatherMap Telemetry</li>
              <li>• SerpApi Google Maps Intelligence</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 BlindSpot Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 font-medium">Light Frosted Glass Architecture</span>
            <span>•</span>
            <span className="text-cyan-700 font-mono font-semibold">Status: Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
