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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Investigation Archive & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-glass-light flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-200">
            <History className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Total Dossiers Stored</span>
            <div className="text-2xl font-bold text-white font-mono">{totalCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-glass-light flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Average Awareness Index</span>
            <div className="text-2xl font-bold text-white font-mono">{avgScore}/100</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-glass-light flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-200">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Encrypted Local Storage</span>
            <div className="text-sm font-semibold text-emerald-400">Active & Synced</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl p-3 border border-slate-200/90 shadow-glass-light flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved investigations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/85 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center text-xs">
          <span className="text-slate-500">Filter Demographic:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/85 border border-slate-200 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
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
        <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-slate-200/90 shadow-glass-light">
          <History className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Investigations Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/90 shadow-glass-light cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                      {inv.destinationName}
                    </h3>
                    <Badge variant={badgeVariant}>
                      Index: {index}/100
                    </Badge>
                    {inv.isSample && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        Sample
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {inv.dates.start} to {inv.dates.end} ({inv.dates.days} Days)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {inv.travellerType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Created: {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenReport(inv)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-white border border-slate-200 text-xs flex items-center gap-1 transition-colors"
                    title="View Full Dossier"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dossier</span>
                  </button>

                  <button
                    onClick={() => handleOpenDashboard(inv)}
                    className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 border border-cyan-200 text-xs flex items-center gap-1 transition-colors"
                    title="Open Dashboard"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(inv.id, e)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-400 border border-slate-200 transition-colors"
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
