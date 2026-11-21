import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { InvestigationProvider } from './context/InvestigationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
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
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
          <Navbar />

          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/investigate" element={<InvestigationPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              {/* Fallback */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </InvestigationProvider>
    </BrowserRouter>
  );
}

export default App;
