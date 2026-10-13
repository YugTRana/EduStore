import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { auth } from '../firebase.js';

function DashboardShell({ role, title, description, children }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  async function handleSignOut() {
    await signOut(auth);
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link className="wordmark" to="/" aria-label="EduStore home">
          <span className="wordmark-mark">e</span>edustore<span className="wordmark-period">.</span>
        </Link>
        <div className="dashboard-user">
          <span className="role-label">{role}</span>
          <button className="signout-button" onClick={handleSignOut} type="button">Sign out</button>
        </div>
      </header>
      <section className="dashboard-content">
        <p className="eyebrow eyebrow-dark">{role.toUpperCase()} PORTAL</p>
        <h1>{title}, {profile?.name || user?.displayName || 'there'}.</h1>
        <p className="dashboard-description">{description}</p>
        {children}
      </section>
    </main>
  );
}

export default DashboardShell;