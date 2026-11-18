import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { toast } from 'react-toastify';
import './Customers.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      toast.error('Failed to load customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customerId) => {
    try {
      const data = await customerService.getById(customerId);
      setSelectedCustomer(data);
      setShowDetails(true);
    } catch (err) {
      toast.error('Failed to load customer details');
      console.error(err);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>👥 Customers</h1>
          <p className="subtitle">Manage customer accounts and view their ticket history</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{customers.length}</span>
            <span className="stat-label">Total Customers</span>
          </div>
        </div>
      </div>

      <div className="customers-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Total Tickets</th>
              <th>Open</th>
              <th>In Progress</th>
              <th>Resolved</th>
              <th>Member Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-row">
                  {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{customer.name}</strong>
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>
                    <span className="badge badge-total">{customer.total_tickets}</span>
                  </td>
                  <td>
                    <span className="badge badge-open">{customer.open_tickets}</span>
                  </td>
                  <td>
                    <span className="badge badge-progress">{customer.in_progress_tickets}</span>
                  </td>
                  <td>
                    <span className="badge badge-resolved">{customer.resolved_tickets}</span>
                  </td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleViewCustomer(customer.id)}
                      className="btn-view"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="modal-close" onClick={() => setShowDetails(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="customer-info">
                <div className="customer-avatar-large">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="customer-details">
                  <h3>{selectedCustomer.name}</h3>
                  <p>{selectedCustomer.email}</p>
                  <p className="customer-meta">
                    Member since {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="customer-tickets">
                <h3>Ticket History ({selectedCustomer.tickets.length})</h3>
                {selectedCustomer.tickets.length === 0 ? (
                  <p className="no-tickets">No tickets found</p>
                ) : (
                  <div className="tickets-list">
                    {selectedCustomer.tickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        to={`/tickets/${ticket.id}`}
                        className="ticket-item"
                        onClick={() => setShowDetails(false)}
                      >
                        <div className="ticket-header">
                          <span className={`badge badge-${ticket.status}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className="ticket-date">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4>{ticket.subject}</h4>
                        <p className="ticket-excerpt">
                          {ticket.description.substring(0, 100)}...
                        </p>
                        <span className={`badge badge-type-${ticket.issue_type}`}>
                          {ticket.issue_type.replace('_', ' ')}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
