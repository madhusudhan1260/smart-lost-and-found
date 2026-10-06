import { Route, Routes, useLocation } from 'react-router-dom';
import { useMode } from './context/ModeContext';
import useRipple from './hooks/useRipple';
import useOnlineStatus from './hooks/useOnlineStatus';
import usePendingTitleBadge from './hooks/usePendingTitleBadge';
import { useItems } from './context/ItemContext';
import { STATUS } from './data/constants';
import Icon from './components/Icon';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
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
import NotFound from './pages/NotFound';

export default function App() {
  const location = useLocation();
  const { isDoss } = useMode();
  useRipple(); // Material ripple on every button
  const online = useOnlineStatus();
  const { claims } = useItems();
  const pendingCount = claims.filter((claim) => claim.status === STATUS.CLAIM_PENDING).length;
  usePendingTitleBadge(pendingCount, isDoss);

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      {!online && (
        <div className="offline-banner" role="status">
          <Icon name="cloud_off" /> You are offline. Everything still works – your data is saved in this browser.
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
