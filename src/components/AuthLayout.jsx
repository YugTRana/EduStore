import { Link } from 'react-router-dom';

function AuthLayout({ title, description, children, footer }) {
  return (
    <main className="auth-layout">
      <aside className="auth-aside">
        <Link className="wordmark" to="/" aria-label="EduStore home">
          <span className="wordmark-mark">e</span>
          edustore<span className="wordmark-period">.</span>
        </Link>
        <div className="auth-aside-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR CAMPUS, SHARED</p>
          <h1>Good notes.<br /><span>Better together.</span></h1>
          <p>Find the resources your teachers share, all in one place.</p>
        </div>
        <span className="auth-aside-index">EDU / CAMPUS LIBRARY</span>
      </aside>
      <section className="auth-content">
        <div className="auth-card">
          <p className="auth-kicker">EDUSTORE ACCOUNT</p>
          <h2>{title}</h2>
          <p className="auth-description">{description}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;