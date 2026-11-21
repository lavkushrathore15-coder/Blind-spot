import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { InvestigationProvider } from './context/InvestigationContext';
import GlassAppShell from './components/layout/GlassAppShell';
import LandingPage from './pages/LandingPage';
import InvestigationPage from './pages/InvestigationPage';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <InvestigationProvider>
        <ScrollToTop />
        <GlassAppShell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/investigate" element={<InvestigationPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/history" element={<HistoryPage />} />
            {/* Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </GlassAppShell>
      </InvestigationProvider>
    </BrowserRouter>
  );
}

export default App;
