import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useMode } from './context/ModeContext';
import { useItems } from './context/ItemContext';
import { useNotification } from './context/NotificationContext';
import useRipple from './hooks/useRipple';
import useOnlineStatus from './hooks/useOnlineStatus';
import useTheme from './hooks/useTheme';
import Icon from './components/ui/Icon';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import BackToTop from './components/layout/BackToTop';
import KeyboardShortcuts from './components/layout/KeyboardShortcuts';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Home from './pages/public/Home';

// Code splitting: every other page is downloaded the first time it is opened,
// so the first visit only loads Home and the shared layout.
const LostItems = lazy(() => import('./pages/public/LostItems'));
const FoundItems = lazy(() => import('./pages/public/FoundItems'));
const ReportLost = lazy(() => import('./pages/student/ReportLost'));
const ReportFound = lazy(() => import('./pages/student/ReportFound'));
const ItemDetails = lazy(() => import('./pages/public/ItemDetails'));
const ClaimItem = lazy(() => import('./pages/student/ClaimItem'));
const MyClaims = lazy(() => import('./pages/student/MyClaims'));
const SmartMatch = lazy(() => import('./pages/public/SmartMatch'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const DossDashboard = lazy(() => import('./pages/doss/DossDashboard'));
const DossClaims = lazy(() => import('./pages/doss/DossClaims'));
const ClaimReview = lazy(() => import('./pages/doss/ClaimReview'));
const ResolvedItems = lazy(() => import('./pages/public/ResolvedItems'));
const Login = lazy(() => import('./pages/auth/Login'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

export default function App() {
  const location = useLocation();
  const { isDoss } = useMode();
  useRipple(); // Material ripple on every button
  const theme = useTheme(); // applies light / dark colours
  const online = useOnlineStatus();
  const { error: dataError, reload } = useItems();
  const { notify } = useNotification();

  // Back online after being offline → fetch the latest reports automatically
  const wasOffline = useRef(!online);
  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      notify('Back online – loading the latest reports', 'info', 2500);
      reload();
    }
  }, [online, reload, notify]);

  // While the server cannot be reached, try again on its own every 15 seconds
  const RETRY_SECONDS = 15;
  const [retryIn, setRetryIn] = useState(RETRY_SECONDS);
  useEffect(() => {
    if (!dataError) return undefined;
    const timer = setTimeout(() => {
      if (retryIn > 1) {
        setRetryIn(retryIn - 1);
      } else {
        setRetryIn(RETRY_SECONDS);
        reload();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [dataError, retryIn, reload]);

  // The sign-in page is a full-screen layout of its own (no navbar or footer)
  if (location.pathname === '/login') {
    return (
      <div className="app">
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner label="Loading sign-in…" />}>
          <Login />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar theme={theme} />
      {!online && (
        <div className="offline-banner" role="status">
          <Icon name="cloud_off" /> You are offline. Reports are saved on the server, so reconnect to see the latest data.
        </div>
      )}
      {dataError && (
        <div className="server-banner" role="alert">
          <Icon name="dns" /> {dataError}
          <span className="server-banner__retry">Retrying in {retryIn}s</span>
          <button type="button" className="btn btn--sm btn--outline" onClick={() => { setRetryIn(RETRY_SECONDS); reload(); }}>Try again now</button>
        </div>
      )}
      {/* key on pathname replays the page-enter animation on every navigation */}
      <main id="main" className="page" key={location.pathname}>
        <Suspense fallback={<LoadingSpinner label="Loading page…" />}>
        <Routes>
          {/* shared */}
          <Route path="/" element={<Home />} />
          <Route path="/lost" element={<LostItems />} />
          <Route path="/found" element={<FoundItems />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/smart-match" element={<SmartMatch />} />
          <Route path="/smart-match/:id" element={<SmartMatch />} />
          <Route path="/resolved" element={<ResolvedItems />} />
          <Route path="/dashboard" element={isDoss ? <DossDashboard /> : <StudentDashboard />} />

          {/* student */}
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/items/:id/claim" element={<ClaimItem />} />
          <Route path="/my-claims" element={<MyClaims />} />

          {/* DOSS */}
          <Route path="/doss/claims" element={<DossClaims />} />
          <Route path="/doss/claims/:claimId" element={<ClaimReview />} />

          {/* Super Admin */}
          <Route path="/admin/users" element={<AdminUsers />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
      <KeyboardShortcuts />
    </div>
  );
}
