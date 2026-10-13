import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/useAuth.js';
import { auth } from '../firebase.js';
import { getAuthErrorMessage, readUserProfile } from '../services/authService.js';

function Login() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="auth-loading">Checking your account...</div>;
  if (user && role === 'student') return <Navigate to="/student" replace />;
  if (user && role === 'teacher') return <Navigate to="/teacher" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await readUserProfile(credential.user.uid);

      if (profile?.role !== 'student' && profile?.role !== 'teacher') {
        await signOut(auth);
        setError('This account has no student or teacher profile. Students can register; teachers need an account from the college administrator.');
        return;
      }

      navigate(profile.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back."
      description="Sign in with your college portal account. We’ll send you to the right place based on your account role."
      footer={<>New to EduStore? <Link to="/register">Create a student account</Link></>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className='md:text-lg opacity-80' >Email Address : </span>
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} placeholder='enter email address'/>
        </label>
        <label className="auth-field">
          <span className='md:text-lg opacity-80'>Password : </span>
          <input autoComplete="current-password" minLength="6" onChange={(event) => setPassword(event.target.value)} required type="password" value={password}  placeholder='enter password'/>
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={submitting} type="submit">
          {submitting ? 'Signing in...' : 'Sign in'} <span aria-hidden="true">↗</span>
        </button>
        <p className="auth-hint" ><b>Teacher?</b> Sign in here with the account created by your administrator.</p>
      </form>
    </AuthLayout>
  );
}

export default Login;