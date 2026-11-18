import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import './CreateTicket.css';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    issue_type: searchParams.get('issueType') || 'order_issue',
    order_number: searchParams.get('orderNumber') || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const ticket = await ticketService.create(formData);
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      console.error('Create ticket error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create ticket';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/tickets')}>
          ← Back to Tickets
        </button>
        <h1>Create New Ticket</h1>
      </div>

      <div className="ticket-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">
              Subject <span className="required">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief description of your issue"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="issue_type">
              Issue Type <span className="required">*</span>
            </label>
            <select
              id="issue_type"
              name="issue_type"
              value={formData.issue_type}
              onChange={handleChange}
              required
            >
              <option value="order_issue">Order Issue</option>
              <option value="payment_issue">Payment Issue</option>
              <option value="general_inquiry">General Inquiry</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(formData.issue_type === 'order_issue' || formData.issue_type === 'payment_issue') && (
            <div className="form-group">
              <label htmlFor="order_number">
                {orders.length > 0 ? 'Select Order' : 'Order Number'} {formData.issue_type === 'order_issue' && <span className="required">*</span>}
              </label>
              {orders.length > 0 ? (
                <select
                  id="order_number"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleChange}
                  required={formData.issue_type === 'order_issue'}
                >
                  <option value="">-- Select an order --</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.order_number}>
                      {order.order_number} - {order.status} ({new Date(order.ordered_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="order_number"
                  name="order_number"
                  value={formData.order_number}
                  onChange={handleChange}
                  placeholder="e.g., ORD-1001"
                  required={formData.issue_type === 'order_issue'}
                />
              )}
              <small className="field-hint">
                {formData.issue_type === 'order_issue' 
                  ? 'Select your order to help us investigate the issue'
                  : 'Optional: Select order if related to a payment issue'}
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your issue. Include order numbers, dates, or any relevant details."
              required
              rows={8}
              maxLength={2000}
            />
            <div className="char-count">
              {formData.description.length} / 2000 characters
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/tickets')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>

        <div className="help-text">
          <h3>💡 Tips for creating a ticket:</h3>
          <ul>
            <li>Be specific and clear in your subject line</li>
            <li>Include order numbers (e.g., ORD-1001) if applicable</li>
            <li>Describe what you expected vs. what actually happened</li>
            <li>Add any error messages or screenshots details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
