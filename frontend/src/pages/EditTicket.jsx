import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { toast } from 'react-toastify';
import './CreateTicket.css';

export default function EditTicket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    issue_type: 'order_issue',
    order_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const ticket = await ticketService.getById(id);
      
      // Check if ticket can be edited
      if (ticket.status !== 'open' || ticket.assigned_agent_id) {
        toast.error('This ticket can no longer be edited');
        navigate(`/tickets/${id}`);
        return;
      }
      
      setFormData({
        subject: ticket.subject,
        description: ticket.description,
        issue_type: ticket.issue_type,
        order_number: ticket.order_number || ''
      });
    } catch (err) {
      console.error('Load ticket error:', err);
      toast.error('Failed to load ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
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

    setSubmitting(true);
    try {
      await ticketService.update(id, formData);
      toast.success('Ticket updated successfully!');
      navigate(`/tickets/${id}`);
    } catch (err) {
      console.error('Update ticket error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to update ticket';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      await ticketService.delete(id);
      toast.success('Ticket deleted successfully');
      navigate('/tickets');
    } catch (err) {
      console.error('Delete ticket error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete ticket';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div className="loading">Loading ticket...</div>;
  }

  return (
    <div className="create-ticket-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(`/tickets/${id}`)}>
          ← Back to Ticket
        </button>
        <h1>Edit Ticket</h1>
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
                Order Number {formData.issue_type === 'order_issue' && <span className="required">*</span>}
              </label>
              <input
                type="text"
                id="order_number"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                placeholder="e.g., ORD-1001"
                required={formData.issue_type === 'order_issue'}
              />
              <small className="field-hint">
                {formData.issue_type === 'order_issue' 
                  ? 'Please provide your order number so we can investigate'
                  : 'Optional: Provide order number if related to a payment issue'}
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
              className="btn-danger"
              onClick={handleDelete}
              disabled={submitting}
            >
              Delete Ticket
            </button>
            <div style={{ flex: 1 }}></div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/tickets/${id}`)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="help-text">
          <h3>ℹ️ Note:</h3>
          <ul>
            <li>You can only edit tickets that haven't been assigned to an agent yet</li>
            <li>Once an agent starts working on your ticket, editing will be disabled</li>
            <li>Deleting a ticket is permanent and cannot be undone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
