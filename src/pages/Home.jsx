import { Link } from 'react-router-dom';

const subjects = [
  { number: '01', name: 'Computer Science', detail: 'Programming, networks, and more', tone: 'coral' },
  { number: '02', name: 'Mathematics', detail: 'Concepts, solved examples, and notes', tone: 'gold' },
  { number: '03', name: 'Physics', detail: 'Clear notes for complex ideas', tone: 'mint' },
  { number: '04', name: 'Business Studies', detail: 'Management, finance, and economics', tone: 'lilac' },
];

function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="EduStore home">
          <span className="wordmark-mark">e</span>
          edustore<span className="wordmark-period">.</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#subjects">Subjects</a>
          <a href="#how-it-works">How it works</a>
          <a href="#for-teachers">For teachers</a>
        </nav>
        <div className="header-actions">
          <Link className="login-link" to="/login">Log in</Link>
          <Link className="button button-small" to="/login">Explore materials <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR CAMPUS, SHARED</p>
          <h1>Good notes.<br /><span>Better together.</span></h1>
          <p className="hero-description">
            A home for the study materials that make college a little easier. Find your subject, learn from your teachers, and keep moving forward.
          </p>
          <div className="hero-actions">
            <a className="button" href="#subjects">Browse subjects <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↗</span></a>
          </div>
          <div className="campus-note">
            <span className="note-mark" aria-hidden="true">✳</span>
            <p><strong>Made for your college community</strong><br />Materials shared by the people who teach your classes.</p>
          </div>
        </div>
        <div className="hero-art" aria-label="A welcoming college library" role="img">
          <div className="art-label"><span className="art-label-dot" /> A LITTLE MORE CLARITY, EVERY DAY</div>
          <div className="art-caption"><span>THE SHARED SHELF</span><span>01</span></div>
        </div>
        <div className="hero-index" aria-hidden="true">EDU / 001</div>
      </section>

      <section className="subjects-section" id="subjects">
        <div className="section-heading">
          <div>
            <p className="eyebrow eyebrow-dark">START WITH A SUBJECT</p>
            <h2>Your next study session<br />starts <span>right here.</span></h2>
          </div>
          <p className="section-intro">Browse the shelves by subject. Your teachers keep the materials organized, so the right resource is easier to find.</p>
        </div>
        <div className="subject-grid">
          {subjects.map((subject) => (
            <Link className={`subject-card ${subject.tone}`} to="/login" key={subject.number}>
              <span className="subject-number">{subject.number} / SUBJECT</span>
              <span className="subject-spark" aria-hidden="true">↗</span>
              <span className="subject-name">{subject.name}</span>
              <span className="subject-detail">{subject.detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-heading">
          <p className="eyebrow">SIMPLE BY DESIGN</p>
          <h2>Less searching.<br /><span>More understanding.</span></h2>
        </div>
        <div className="steps-list">
          <article className="step-item">
            <span className="step-number">01</span>
            <div><h3>Pick your subject</h3><p>Go straight to the class you’re studying for.</p></div>
          </article>
          <article className="step-item">
            <span className="step-number">02</span>
            <div><h3>Find a resource</h3><p>Browse notes and files shared by your teachers.</p></div>
          </article>
          <article className="step-item">
            <span className="step-number">03</span>
            <div><h3>Learn at your pace</h3><p>Open or download what you need, whenever you need it.</p></div>
          </article>
        </div>
      </section>

      <section className="teacher-band" id="for-teachers">
        <div className="teacher-icon" aria-hidden="true">✳</div>
        <div>
          <p className="eyebrow">FOR THE PEOPLE WHO TEACH</p>
          <h2>Your classroom has a<br />place on the shelf.</h2>
        </div>
        <p className="teacher-copy">Teachers can share notes and learning materials with their students. Teacher accounts are created by your college administrator.</p>
        <Link className="teacher-link" to="/login">Teacher log in <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className="site-footer" id="student-access">
        <a className="wordmark footer-wordmark" href="#top"><span className="wordmark-mark">e</span>edustore<span className="wordmark-period">.</span></a>
        <p>Study resources, shared with care.</p>
        <Link className="footer-top" to="/register">Create a student account</Link>
      </footer>
    </main>
  );
}

export default Home;