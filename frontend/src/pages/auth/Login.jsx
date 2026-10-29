// File: src/pages/auth/Login.jsx
// Purpose: Page /login – one sign-in page with a tab for each kind of account:
//          Student (can also sign up), DOSS staff and Super Admin.
// Used by: App.jsx
//
// /login?role=doss&next=/doss/claims opens the DOSS tab and returns to that page afterwards.

import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import { useItems } from '../../context/ItemContext';
import { useNotification } from '../../context/NotificationContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { DEMO_ACCOUNTS, MODES, ROLE_META, ROLES, STATUS } from '../../data/constants';
import { getPasswordStrength, validateAccount, validateLogin } from '../../utils/authValidation';
import { cx } from '../../utils/helpers';
import logo from '../../assets/logo.svg';
import Icon from '../../components/ui/Icon';

const PORTALS = [
  {
    role: ROLES.STUDENT,
    title: 'Student sign in',
    subtitle: 'Track your claims and report items faster with your details filled in.',
  },
  {
    role: ROLES.DOSS,
    title: 'DOSS staff sign in',
    subtitle: 'Review ownership claims, see private verification details and hand items over.',
  },
  {
    role: ROLES.SUPER_ADMIN,
    title: 'Super Admin sign in',
    subtitle: 'Manage DOSS staff and student accounts for the whole campus.',
  },
];

// Where each kind of account lands after signing in
const HOME_FOR_ROLE = { student: '/dashboard', doss: '/dashboard', superadmin: '/admin/users' };

const EMPTY_SIGNUP = { name: '', rollNumber: '', email: '', password: '', confirmPassword: '' };

// Only allow returning to a page inside this app (never an outside URL)
const safeNext = (value) => (value && value.startsWith('/') && !value.startsWith('//') && value !== '/login' ? value : null);

export default function Login() {
  const [params, setParams] = useSearchParams();
  const initialRole = PORTALS.some((p) => p.role === params.get('role')) ? params.get('role') : ROLES.STUDENT;
  const next = safeNext(params.get('next'));

  const { user, login, register, logout } = useAuth();
  const { enterMode } = useMode();
  const { items } = useItems();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [role, setRole] = useState(initialRole);
  const [signingUp, setSigningUp] = useState(params.get('mode') === 'signup' && initialRole === ROLES.STUDENT);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState(EMPTY_SIGNUP);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [busy, setBusy] = useState(false);

  useDocumentTitle(signingUp ? 'Create account' : 'Sign in');

  const portal = PORTALS.find((p) => p.role === role);
  const strength = getPasswordStrength(signup.password);

  // A small live number for the brand panel
  const returnedCount = useMemo(
    () => items.filter((item) => item.type === 'found' && [STATUS.COLLECTED, STATUS.RESOLVED].includes(item.status)).length,
    [items],
  );

  const chooseRole = (nextRole) => {
    setRole(nextRole);
    setSigningUp(false);
    setErrors({});
    setFormError('');
    setCredentials({ email: '', password: '' });
    setParams((current) => {
      const updated = new URLSearchParams(current);
      updated.set('role', nextRole);
      updated.delete('mode');
      return updated;
    }, { replace: true });
  };

  // Arrow keys move between the tabs (WAI-ARIA tabs pattern)
  const handleTabKeyDown = (event) => {
    const index = PORTALS.findIndex((p) => p.role === role);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const nextPortal = PORTALS[(index + step + PORTALS.length) % PORTALS.length];
    chooseRole(nextPortal.role);
    document.getElementById(`login-tab-${nextPortal.role}`)?.focus();
  };

  const finish = (signedIn, message) => {
    enterMode(signedIn.role === ROLES.STUDENT ? MODES.STUDENT : MODES.DOSS);
    notify(message, 'success', 2500);
    navigate(next ?? HOME_FOR_ROLE[signedIn.role], { replace: true });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const found = validateLogin(credentials);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const signedIn = await login(credentials.email.trim(), credentials.password, role);
      finish(signedIn, `Welcome back, ${signedIn.name.split(' ')[0]}`);
    } catch (err) {
      setFormError(err.message);
      setCredentials((current) => ({ ...current, password: '' }));
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    const found = validateAccount(signup);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const { confirmPassword: _unused, ...fields } = signup;
      const signedIn = await register({ ...fields, email: fields.email.trim(), name: fields.name.trim() });
      finish(signedIn, 'Your student account is ready');
    } catch (err) {
      setFormError(err.message);
      if (err.details) setErrors(err.details);
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setCredentials(DEMO_ACCOUNTS[role]);
    setErrors({});
    setFormError('');
  };

  const detectCapsLock = (event) => setCapsLock(Boolean(event.getModifierState?.('CapsLock')));

  // Props shared by every text box: value, change handler, error styling and aria links
  const bind = (state, setState, name) => ({
    id: `auth-${name}`,
    name,
    value: state[name],
    onChange: (event) => {
      setState((current) => ({ ...current, [name]: event.target.value }));
      if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    },
    className: cx(errors[name] && 'has-error'),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `auth-${name}-error` : undefined,
  });

  const fieldError = (name) =>
    errors[name] && <p id={`auth-${name}-error`} className="field-error">{errors[name]}</p>;

  return (
    <div className="auth">
      {/* ---------- Brand panel ---------- */}
      <aside className="auth__brand">
        <Link to="/" className="auth__logo">
          <img src={logo} alt="" width="40" height="40" />
          <span>Smart <strong>Lost &amp; Found</strong></span>
        </Link>

        <div className="auth__pitch">
          <p className="auth__eyebrow">College Campus · DOSS Office</p>
          <h1>Every lost item deserves a way home.</h1>
          <p>Report, match and return lost belongings across campus. Ownership is verified by the DOSS office before anything is handed over.</p>
          <ul className="auth__features">
            <li><Icon name="join_inner" /> Smart Match pairs lost and found reports</li>
            <li><Icon name="verified_user" /> Private details prove who the owner is</li>
            <li><Icon name="notifications_active" /> Follow every claim from submitted to collected</li>
          </ul>
        </div>

        <div className="auth__stats">
          <div><strong>{items.length}</strong><span>reports on campus</span></div>
          <div><strong>{returnedCount}</strong><span>items returned</span></div>
        </div>
      </aside>

      {/* ---------- Sign-in card ---------- */}
      <main className="auth__main">
        <div className="auth__card">
          <Link to="/" className="auth__back"><Icon name="arrow_back" /> Back to home</Link>

          {user ? (
            <div className="auth__signed-in">
              <span className={`auth__avatar auth__avatar--${ROLE_META[user.role].tone}`}><Icon name={ROLE_META[user.role].icon} /></span>
              <h2>You are signed in</h2>
              <p className="muted">{user.name} · {ROLE_META[user.role].label}<br />{user.email}</p>
              <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => navigate(next ?? HOME_FOR_ROLE[user.role])}>
                Continue <Icon name="arrow_forward" />
              </button>
              <button type="button" className="btn btn--text btn--block" onClick={() => { logout(); notify('Signed out', 'info', 2000); }}>
                Sign out and use another account
              </button>
            </div>
          ) : (
            <>
              <div className="auth-tabs" role="tablist" aria-label="Account type" onKeyDown={handleTabKeyDown}>
                {PORTALS.map((p) => (
                  <button
                    key={p.role}
                    id={`login-tab-${p.role}`}
                    type="button"
                    role="tab"
                    aria-selected={role === p.role}
                    aria-controls="login-panel"
                    tabIndex={role === p.role ? 0 : -1}
                    className={cx('auth-tabs__tab', role === p.role && 'is-active')}
                    onClick={() => chooseRole(p.role)}
                  >
                    <Icon name={ROLE_META[p.role].icon} />
                    <span>{ROLE_META[p.role].label}</span>
                  </button>
                ))}
              </div>

              <section id="login-panel" role="tabpanel" aria-labelledby={`login-tab-${role}`} className="auth__panel" key={`${role}-${signingUp}`}>
                <header className="auth__head">
                  <h2>{signingUp ? 'Create your student account' : portal.title}</h2>
                  <p className="muted">{signingUp ? 'Use your college email. You can report and claim items with it right away.' : portal.subtitle}</p>
                </header>

                {formError && (
                  <div className="auth__alert" role="alert">
                    <Icon name="error" /> <span>{formError}</span>
                  </div>
                )}

                {signingUp ? (
                  <form className="auth__form" onSubmit={handleSignup} noValidate>
                    <div className="form-field">
                      <label htmlFor="auth-name">Full name</label>
                      <input {...bind(signup, setSignup, 'name')} autoComplete="name" autoFocus placeholder="Rahul Sharma" />
                      {fieldError('name')}
                    </div>
                    <div className="auth__row">
                      <div className="form-field">
                        <label htmlFor="auth-rollNumber">Roll number / USN</label>
                        <input {...bind(signup, setSignup, 'rollNumber')} autoComplete="off" placeholder="22CSE045" />
                        {fieldError('rollNumber')}
                      </div>
                      <div className="form-field">
                        <label htmlFor="auth-email">College email</label>
                        <input {...bind(signup, setSignup, 'email')} type="email" autoComplete="email" placeholder="name@college.edu" />
                        {fieldError('email')}
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="auth-password">Password</label>
                      <div className="auth__password">
                        <input {...bind(signup, setSignup, 'password')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" onKeyUp={detectCapsLock} />
                        <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
                      </div>
                      {signup.password && (
                        <div className={`strength strength--${strength.score}`} aria-live="polite">
                          <span className="strength__bar"><span /></span>
                          <span className="strength__label">{strength.label}</span>
                        </div>
                      )}
                      {fieldError('password') || <p className="field-hint">At least 8 characters with a letter and a number.</p>}
                    </div>
                    <div className="form-field">
                      <label htmlFor="auth-confirmPassword">Confirm password</label>
                      <input {...bind(signup, setSignup, 'confirmPassword')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" />
                      {fieldError('confirmPassword')}
                    </div>
                    {capsLock && <p className="auth__caps"><Icon name="keyboard_capslock" /> Caps Lock is on</p>}

                    <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
                      {busy ? <><Icon name="progress_activity" className="spin" /> Creating account…</> : 'Create account'}
                    </button>
                    <p className="auth__switch">
                      Already have an account?{' '}
                      <button type="button" className="auth__link" onClick={() => { setSigningUp(false); setErrors({}); setFormError(''); }}>Sign in</button>
                    </p>
                  </form>
                ) : (
                  <form className="auth__form" onSubmit={handleLogin} noValidate>
                    <div className="form-field">
                      <label htmlFor="auth-email">Email</label>
                      <div className="auth__input-icon">
                        <Icon name="mail" />
                        <input {...bind(credentials, setCredentials, 'email')} type="email" autoComplete="username" autoFocus placeholder="name@college.edu" />
                      </div>
                      {fieldError('email')}
                    </div>
                    <div className="form-field">
                      <label htmlFor="auth-password">Password</label>
                      <div className="auth__input-icon auth__password">
                        <Icon name="lock" />
                        <input
                          {...bind(credentials, setCredentials, 'password')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          onKeyUp={detectCapsLock}
                        />
                        <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
                      </div>
                      {fieldError('password')}
                      {capsLock && <p className="auth__caps"><Icon name="keyboard_capslock" /> Caps Lock is on</p>}
                    </div>

                    <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
                      {busy ? <><Icon name="progress_activity" className="spin" /> Signing in…</> : <>Sign in <Icon name="arrow_forward" /></>}
                    </button>

                    <div className="auth__demo">
                      <Icon name="key" />
                      <span className="auth__demo-text">
                        Demo {ROLE_META[role].label.toLowerCase()} account<br />
                        <code>{DEMO_ACCOUNTS[role].email}</code>
                      </span>
                      <button type="button" id="login-fill-demo-btn" className="btn btn--sm btn--tonal" onClick={fillDemo}>Use demo</button>
                    </div>

                    {role === ROLES.STUDENT ? (
                      <p className="auth__switch">
                        New to Smart Lost &amp; Found?{' '}
                        <button type="button" className="auth__link" onClick={() => { setSigningUp(true); setErrors({}); setFormError(''); }}>Create an account</button>
                      </p>
                    ) : (
                      <p className="auth__note"><Icon name="info" /> Staff accounts are created by the Super Admin. Forgot your password? Contact the DOSS office.</p>
                    )}
                  </form>
                )}
              </section>

              <div className="auth__divider"><span>or</span></div>
              <Link to="/" className="btn btn--outline btn--block">
                <Icon name="travel_explore" /> Continue as guest
              </Link>
              <p className="auth__fineprint">Guests can browse, report and claim items. Signing in keeps your claims together.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function PasswordToggle({ shown, onToggle }) {
  return (
    <button type="button" className="auth__eye" onClick={onToggle} aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown}>
      <Icon name={shown ? 'visibility_off' : 'visibility'} />
    </button>
  );
}
