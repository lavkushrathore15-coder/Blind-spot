import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import healthService from '../../services/healthService';

export const HealthDashboard = ({ healthData, onRefresh }) => {
  // Test validation state
  const [testTitle, setTestTitle] = useState('');
  const [testThreshold, setTestThreshold] = useState('0.75');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const handleTestValidation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationResult(null);
    setValidationError(null);

    try {
      const response = await healthService.testValidation({
        title: testTitle,
        threshold: parseFloat(testThreshold),
        tags: ['foundation', 'security', 'health'],
      });
      setValidationResult(response);
    } catch (err) {
      setValidationError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sys = healthData?.system || {};
  const mem = healthData?.memory || {};

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">API Status</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{healthData?.status || 'UNKNOWN'}</span>
            <Badge variant="success">Online</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Operational & Responding</p>
        </Card>

        <Card className="hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Service Uptime</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{healthData?.uptime?.formatted || '0s'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{healthData?.uptime?.seconds || 0} seconds active</p>
        </Card>

        <Card className="hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Heap Memory</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{mem.heapUsedMB || 0} MB</span>
            <span className="text-xs text-slate-400">/ {mem.heapTotalMB || 0} MB</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">RSS: {mem.rssMB || 0} MB</p>
        </Card>

        <Card className="hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Security Boundary</span>
            <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">Isolated</span>
            <Badge variant="info">Enforced</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">API Keys strictly server-side</p>
        </Card>
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backend System Specs */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="System & Runtime Diagnostics"
            subtitle="Live metadata provided by GET /api/health"
            icon={Server}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Host System</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">OS Platform:</span>
                    <span className="font-mono text-slate-200">{sys.platform || 'N/A'} ({sys.architecture})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CPU Cores:</span>
                    <span className="font-mono text-slate-200">{sys.cpuCount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Free System RAM:</span>
                    <span className="font-mono text-slate-200">{sys.freeMemoryMB} MB / {sys.totalMemoryMB} MB</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Node & Runtime</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node Engine:</span>
                    <span className="font-mono text-indigo-400">{sys.nodeVersion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Environment:</span>
                    <span className="font-mono text-amber-400">{healthData?.environment || 'development'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CORS Client Origin:</span>
                    <span className="font-mono text-emerald-400 text-[11px] truncate max-w-[150px]">
                      {healthData?.security?.corsClientAllowed || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono">Timestamp: {healthData?.timestamp}</span>
                <span className="text-emerald-400 font-medium">✓ HTTP 200 OK</span>
              </div>
              <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto p-2 bg-slate-900 rounded border border-slate-800/50">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
          </Card>
        </div>

        {/* Input Validation & Error Handling Tester */}
        <div className="space-y-6">
          <Card
            title="Validation & Error Lab"
            subtitle="Test centralized error handling via POST /api/health/validate-test"
            icon={Zap}
          >
            <form onSubmit={handleTestValidation} className="space-y-4">
              <Input
                label="Resource Title (Required, 3-100 chars)"
                placeholder="e.g. Memory Leak Detector"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                helperText="Leave empty to trigger validation error"
              />

              <Input
                label="Threshold (Decimal between 0.0 and 1.0)"
                placeholder="0.75"
                value={testThreshold}
                onChange={(e) => setTestThreshold(e.target.value)}
                helperText="Enter > 1 or text to trigger validation error"
              />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  isLoading={isSubmitting}
                  icon={Send}
                >
                  Send & Validate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setTestTitle('Valid Analysis Title');
                    setTestThreshold('0.85');
                  }}
                >
                  Fill Valid
                </Button>
              </div>
            </form>

            {/* Validation Feedback */}
            <div className="mt-4">
              {validationResult && (
                <Alert
                  type="success"
                  title="Validation Passed"
                  message={validationResult.message}
                >
                  <pre className="mt-2 text-[10px] font-mono bg-emerald-950/50 p-2 rounded border border-emerald-500/20 text-emerald-200 overflow-x-auto">
                    {JSON.stringify(validationResult.data, null, 2)}
                  </pre>
                </Alert>
              )}

              {validationError && (
                <Alert
                  type="danger"
                  title={`Validation Failed (HTTP ${validationError.statusCode || 422})`}
                  message={validationError.message}
                >
                  {validationError.errors?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] list-disc list-inside text-rose-300">
                      {validationError.errors.map((err, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{err.field}:</span> {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </Alert>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
