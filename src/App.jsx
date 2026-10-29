import { Route, Routes, useLocation } from 'react-router-dom';
import { useMode } from './context/ModeContext';
import { useItems } from './context/ItemContext';
import useRipple from './hooks/useRipple';
import useOnlineStatus from './hooks/useOnlineStatus';
import Icon from './components/ui/Icon';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import BackToTop from './components/layout/BackToTop';
import KeyboardShortcuts from './components/layout/KeyboardShortcuts';
import Home from './pages/public/Home';
import LostItems from './pages/public/LostItems';
import FoundItems from './pages/public/FoundItems';
import ReportLost from './pages/student/ReportLost';
import ReportFound from './pages/student/ReportFound';
import ItemDetails from './pages/public/ItemDetails';
import ClaimItem from './pages/student/ClaimItem';
import MyClaims from './pages/student/MyClaims';
import SmartMatch from './pages/public/SmartMatch';
import StudentDashboard from './pages/student/StudentDashboard';
import DossDashboard from './pages/doss/DossDashboard';
import DossClaims from './pages/doss/DossClaims';
import ClaimReview from './pages/doss/ClaimReview';
import ResolvedItems from './pages/public/ResolvedItems';
import Login from './pages/auth/Login';
import AdminUsers from './pages/admin/AdminUsers';
import NotFound from './pages/public/NotFound';

export default function App() {
  const location = useLocation();
  const { isDoss } = useMode();
  useRipple(); // Material ripple on every button
  const online = useOnlineStatus();
  const { error: dataError, reload } = useItems();

  // The sign-in page is a full-screen layout of its own (no navbar or footer)
  if (location.pathname === '/login') {
    return (
      <div className="app">
        <ScrollToTop />
        <Login />
      </div>
    );
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      {!online && (
        <div className="offline-banner" role="status">
          <Icon name="cloud_off" /> You are offline. Reports are saved on the server, so reconnect to see the latest data.
        </div>
      )}
      {dataError && (
        <div className="server-banner" role="alert">
          <Icon name="dns" /> {dataError}
          <button type="button" className="btn btn--sm btn--outline" onClick={reload}>Try again</button>
        </div>
      )}
      {/* key on pathname replays the page-enter animation on every navigation */}
      <main id="main" className="page" key={location.pathname}>
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
      </main>
      <Footer />
      <BackToTop />
      <KeyboardShortcuts />
    </div>
  );
}
