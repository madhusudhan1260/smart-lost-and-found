// Purpose: DOSS staff login form shown in a dialog.
// Used by: context/AuthContext.jsx

import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';

export default function LoginDialog({ isOpen, onLogin, onSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onLogin(email.trim(), password);
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    setError('');
    onCancel();
  };

  return (
    <Modal isOpen={isOpen} title="DOSS staff login" confirmText="Log in" busy={busy} onConfirm={handleSubmit} onCancel={handleCancel}>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <p className="muted small">Reviewing claims and seeing private verification details needs a DOSS account.</p>
        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <p className="login-form__hint"><Icon name="info" /> Demo account: doss@college.edu / Doss@123</p>
        {/* hidden submit button so the Enter key submits the form */}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}
