import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  Trash2,
  FileText,
  RotateCcw,
  Sparkles,
  Compass,
  Check,
  Building,
  TrendingUp
} from 'lucide-react';
import { useInvestigation } from '../context/InvestigationContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const {
    investigations,
    setCurrentInvestigation,
    deleteInvestigation,
    resetToSampleData
  } = useInvestigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = investigations.filter((inv) => {
    const matchesSearch =
      inv.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.travellerType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || inv.travellerType === filterType;
    return matchesSearch && matchesType;
  });

  // Summary Metrics
  const totalCount = investigations.length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          investigations.reduce((acc, curr) => acc + (curr.awarenessIndex || 0), 0) /
            totalCount
        )
      : 0;

  const handleOpenDashboard = (inv) => {
    setCurrentInvestigation(inv);
    navigate('/dashboard');
  };

  const handleOpenReport = (inv) => {
    setCurrentInvestigation(inv);
    navigate('/report');
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    deleteInvestigation(id);
    showToast('Investigation removed from local history.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-50 border border-cyan-400 text-cyan-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <History className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Investigation Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Investigation Archive & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Review, re-examine, or export previously generated travel safety dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetToSampleData}
            icon={RotateCcw}
          >
            Reset Default Samples
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/investigate')}
            icon={Compass}
          >
            New Investigation
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-medium">Total Dossiers Stored</span>
            <div className="text-2xl font-bold text-white font-mono">{totalCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-medium">Average Awareness Index</span>
            <div className="text-2xl font-bold text-white font-mono">{avgScore}/100</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-medium">Encrypted Local Storage</span>
            <div className="text-sm font-bold text-emerald-400">Active & Synced</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl p-3 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved investigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center text-xs">
          <span className="text-slate-300 font-medium">Filter Demographic:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-100 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Profiles</option>
            <option value="Solo Female Traveller">Solo Female</option>
            <option value="Digital Nomad">Digital Nomad</option>
            <option value="Family with Kids">Family with Kids</option>
            <option value="Independent Traveller">Independent</option>
          </select>
        </div>
      </div>

      {/* Investigations List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-slate-800 shadow-xl">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Investigations Found</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              No investigations matched your filter, or history has been cleared.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetToSampleData}
            icon={Sparkles}
          >
            Restore Default Sample Investigations
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((inv) => {
            const index = inv.awarenessIndex || 70;
            const badgeVariant = index >= 75 ? 'success' : index >= 60 ? 'warning' : 'danger';

            return (
              <div
                key={inv.id}
                onClick={() => handleOpenDashboard(inv)}
                className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 shadow-xl cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {inv.destinationName}
                    </h3>
                    <Badge variant={badgeVariant}>
                      Index: {index}/100
                    </Badge>
                    {inv.isSample && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                        Sample
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {inv.dates.start} to {inv.dates.end} ({inv.dates.days} Days)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {inv.travellerType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Created: {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenReport(inv)}
                    className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition-colors font-semibold"
                    title="View Full Dossier"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dossier</span>
                  </button>

                  <button
                    onClick={() => handleOpenDashboard(inv)}
                    className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs flex items-center gap-1.5 transition-colors font-bold shadow-xs"
                    title="Open Dashboard"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(inv.id, e)}
                    className="p-2 rounded-xl bg-slate-850 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
