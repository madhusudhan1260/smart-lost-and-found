import { Link } from 'react-router-dom';
import { DOSS_OFFICE } from '../data/constants';
import logo from '../assets/logo.svg';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src={logo} alt="" width="28" height="28" />
          <div>
            <p><strong>Smart Lost &amp; Found</strong></p>
            <p className="muted">College Campus Lost &amp; Found Management System</p>
          </div>
        </div>
        <div className="footer__office">
          <p><strong>DOSS Office</strong></p>
          <p className="muted">{DOSS_OFFICE.place}</p>
          <p className="muted">{DOSS_OFFICE.hours}</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/lost">Lost items</Link>
          <Link to="/found">Found items</Link>
          <Link to="/smart-match">Smart Match</Link>
          <Link to="/resolved">Resolved cases</Link>
        </nav>
      </div>
      <p className="container footer__copy muted">© {year} B.Tech CSE Microproject · Built with React &amp; JavaScript</p>
    </footer>
  );
}
