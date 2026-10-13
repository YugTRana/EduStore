import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/useAuth.js';
import { getAuthErrorMessage, registerStudent } from '../services/authService.js';

function Register() {
  const navigate = useNavigate();
  const { user, role, loading, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="auth-loading">Checking your account...</div>;
  if (user && role === 'student') return <Navigate to="/student" replace />;
  if (user && role === 'teacher') return <Navigate to="/teacher" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('The passwords do not match. Check them and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const student = await registerStudent({ name: name.trim(), email: email.trim(), password });
      await refreshProfile(student);
      navigate('/student', { replace: true });
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Make yourself at home."
      description="Create a student account to find and download materials shared by your teachers."
      footer={<>Already registered? <Link to="/login">Sign in</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Full name</span>
          <input autoComplete="name" onChange={(event) => setName(event.target.value)} required type="text" value={name} />
        </label>
        <label className="auth-field">
          <span>Email address</span>
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <div className="auth-field-row">
          <label className="auth-field">
            <span>Password</span>
            <input autoComplete="new-password" minLength="6" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input autoComplete="new-password" minLength="6" onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          </label>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={submitting} type="submit">
          {submitting ? 'Creating account...' : 'Create student account'} <span aria-hidden="true">↗</span>
        </button>
        <p className="auth-hint">Student accounts only. Teacher accounts are created by a college administrator.</p>
      </form>
    </AuthLayout>
  );
}

export default Register;