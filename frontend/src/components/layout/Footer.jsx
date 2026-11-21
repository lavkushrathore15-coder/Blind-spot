import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Eye, Heart, Globe, Lock, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-navy-800 bg-navy-950/90 py-12 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-navy-950">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">BlindSpot Intelligence</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Tactical travel risk intelligence uncovering what traditional guides omit. Built with privacy-first architecture, verified emergency facility mapping, and localized awareness indexing.
            </p>
            <div className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 text-[11px] text-cyan-300 inline-block font-mono">
              Notice: All data in Phase 2 is designated sample intelligence for frontend verification.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Platform Views
            </span>
            <ul className="space-y-1.5">
              <li>
                <NavLink to="/" className="hover:text-cyan-400 transition-colors">
                  Explore Destinations
                </NavLink>
              </li>
              <li>
                <NavLink to="/investigate" className="hover:text-cyan-400 transition-colors">
                  Investigation Engine
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="hover:text-cyan-400 transition-colors">
                  Tactical Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/report" className="hover:text-cyan-400 transition-colors">
                  Intelligence Dossier
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" className="hover:text-cyan-400 transition-colors">
                  Archived Investigations
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Architecture & Security */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Architecture
            </span>
            <ul className="space-y-1.5 text-slate-400 text-[11px] font-mono">
              <li>• React 18 + Vite</li>
              <li>• Tailwind CSS Dark Navy</li>
              <li>• Node.js + Express REST API</li>
              <li>• Centralized Error & Health Grid</li>
              <li>• Isolated Server-Side Secrets</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 BlindSpot Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Phase 2 Premium Frontend Architecture</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">Status: Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
