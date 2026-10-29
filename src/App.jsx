import { Route, Routes, useLocation } from 'react-router-dom';
import { useMode } from './context/ModeContext';
import { useItems } from './context/ItemContext';
import useRipple from './hooks/useRipple';
import useOnlineStatus from './hooks/useOnlineStatus';
import Icon from './components/Icon';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Home from './pages/Home';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import ItemDetails from './pages/ItemDetails';
import ClaimItem from './pages/ClaimItem';
import MyClaims from './pages/MyClaims';
import SmartMatch from './pages/SmartMatch';
import StudentDashboard from './pages/StudentDashboard';
import DossDashboard from './pages/DossDashboard';
import DossClaims from './pages/DossClaims';
import ClaimReview from './pages/ClaimReview';
import ResolvedItems from './pages/ResolvedItems';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

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
