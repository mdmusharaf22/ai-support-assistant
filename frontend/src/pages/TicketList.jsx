import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { toast } from 'react-toastify';
import './TicketList.css';

export default function TicketList() {
  const { user, isAgent, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    issueType: ''
  });

  // Agents always see their assigned tickets by default
  // Admin can see all tickets
  const showAssigned = false; // Not used anymore for agents

  useEffect(() => {
    loadTickets();
  }, [filters, showAssigned]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      const data = await ticketService.getAll(params);
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Loading tickets...</div>;

  // Dynamic title based on role
  const pageTitle = isAdmin ? 'All Support Tickets' : 'My Tickets';

  return (
    <div className="ticket-list-page">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        {!isAdmin && (
          <Link to="/tickets/new" className="btn-primary">
            + Create Ticket
          </Link>
        )}
      </div>

      <div className="filters">
        <select 
          name="status" 
          value={filters.status} 
          onChange={handleFilterChange}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select 
          name="issueType" 
          value={filters.issueType} 
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="order">Order</option>
          <option value="payment">Payment</option>
          <option value="other">Other</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>No tickets found</p>
          <Link to="/tickets/new">Create your first ticket</Link>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <Link 
              key={ticket.id} 
              to={`/tickets/${ticket.id}`}
              className="ticket-card"
            >
              <div className="ticket-card-header">
                <span className={`badge badge-${ticket.status}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`badge badge-type-${ticket.issue_type}`}>
                  {ticket.issue_type}
                </span>
              </div>
              
              <h3>{ticket.subject}</h3>
              <p className="ticket-description">
                {ticket.description.substring(0, 150)}
                {ticket.description.length > 150 ? '...' : ''}
              </p>
              
              <div className="ticket-card-footer">
                <span className="customer-name">
                  👤 {ticket.customer_name}
                </span>
                <span className="ticket-date">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
