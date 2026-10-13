import DashboardShell from '../components/DashboardShell.jsx';

function StudentDashboard() {
  return (
    <DashboardShell
      role="Student"
      title="Welcome"
      description="Your account is connected. Study materials shared by your teachers will appear here."
    >
      <div className="dashboard-empty">
        <span className="dashboard-empty-mark" aria-hidden="true">01</span>
        <h2>Your study shelf is ready.</h2>
        <p>There are no materials to show yet. Check back when your teachers have uploaded resources.</p>
      </div>
    </DashboardShell>
  );
}

export default StudentDashboard;