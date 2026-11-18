import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'react-toastify';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAgent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await dashboardService.getSummary();
      setData(result);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return null;

  // Customer Dashboard
  if (!isAgent) {
    return <CustomerDashboard user={user} data={data} />;
  }

  // Agent Dashboard
  return <AgentDashboard data={data} />;
}

// Customer Dashboard Component
function CustomerDashboard({ user, data }) {
  const { stats, recentTickets } = data;
  
  return (
    <div className="dashboard customer-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p className="subtitle">
          Welcome back, <strong>{user?.name || 'there'}</strong>! 👋
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        
        <div className="stat-card stat-open">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <div className="stat-value">{stats.open || 0}</div>
            <div className="stat-label">Open</div>
          </div>
        </div>
        
        <div className="stat-card stat-progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress || 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        
        <div className="stat-card stat-resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.resolved || 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      <div className="recent-tickets-section">
        <div className="section-header">
          <h2>My Recent Tickets</h2>
          <Link to="/tickets" className="btn-link">View All →</Link>
        </div>
        
        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-title">No tickets yet</p>
            <p className="empty-text">You don't have any support tickets. Go to "My Tickets" to create one.</p>
          </div>
        ) : (
          <div className="tickets-list">
            {recentTickets.map((ticket) => (
              <Link 
                key={ticket.id} 
                to={`/tickets/${ticket.id}`}
                className="ticket-item-card"
              >
                <div className="ticket-card-header">
                  <span className={`badge badge-${ticket.status}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="ticket-date">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="ticket-title">{ticket.subject}</h3>
                <p className="ticket-excerpt">
                  {ticket.description.substring(0, 120)}
                  {ticket.description.length > 120 ? '...' : ''}
                </p>
                <div className="ticket-footer">
                  <span className={`ticket-type type-${ticket.issue_type}`}>
                    {ticket.issue_type.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Agent Dashboard Component
function AgentDashboard({ data }) {
  const { stats, recentTickets } = data;

  return (
    <div className="dashboard agent-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p className="subtitle">My assigned tickets and tasks</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        
        <div className="stat-card stat-open">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <div className="stat-value">{stats.open}</div>
            <div className="stat-label">Open</div>
          </div>
        </div>
        
        <div className="stat-card stat-progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        
        <div className="stat-card stat-resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      <div className="stats-grid secondary-stats">
        <div className="stat-card stat-order">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.orderIssues}</div>
            <div className="stat-label">Order Issues</div>
          </div>
        </div>
        
        <div className="stat-card stat-payment">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.paymentIssues}</div>
            <div className="stat-label">Payment Issues</div>
          </div>
        </div>
      </div>

      <div className="recent-tickets">
        <div className="section-header">
          <h2>My Recent Tickets</h2>
          <Link to="/tickets" className="btn-link">View All →</Link>
        </div>
        
        {recentTickets.length === 0 ? (
          <p className="empty-message">No tickets assigned to you yet</p>
        ) : (
          <div className="tickets-table">
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} className="ticket-link">
                        <strong>#{ticket.id}</strong> - {ticket.subject}
                      </Link>
                    </td>
                    <td>{ticket.customer_name}</td>
                    <td>
                      <span className={`badge badge-type-${ticket.issue_type}`}>
                        {ticket.issue_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${ticket.status}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
