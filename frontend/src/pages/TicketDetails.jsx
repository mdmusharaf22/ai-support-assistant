import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './TicketDetails.css';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAgent, isAdmin } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadTicket();
    if (isAgent) {
      loadAgents();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await ticketService.getById(id);
      setTicket(data);
    } catch (err) {
      toast.error('Failed to load ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const { userService } = await import('../services/userService');
      const agentList = await userService.getAgents();
      setAgents(agentList);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const handleAssignAgent = async (agentId) => {
    try {
      await ticketService.assignAgent(id, agentId);
      const updatedTicket = await ticketService.getById(id);
      setTicket(updatedTicket);
      setShowAssignModal(false);
      toast.success('Agent assigned successfully!');
    } catch (err) {
      toast.error('Failed to assign agent');
      console.error(err);
    }
  };

  const handleInvestigate = async () => {
    try {
      setInvestigating(true);
      const result = await ticketService.investigateWithAI(id);
      setInvestigation(result);
      toast.success('🤖 AI investigation completed successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Investigation failed';
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setInvestigating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketService.updateStatus(id, newStatus);
      setTicket({ ...ticket, status: newStatus });
      toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update ticket status');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading ticket...</div>;
  if (!ticket) {
    toast.error('Ticket not found');
    return <div className="error-message">Ticket not found</div>;
  }

  return (
    <div className="ticket-details-page">
      <button className="btn-back" onClick={() => navigate('/tickets')}>
        ← Back to Tickets
      </button>

      <div className="ticket-header">
        <div>
          <h1>{ticket.subject}</h1>
          <div className="ticket-meta">
            <span className={`badge badge-${ticket.status}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`badge badge-type-${ticket.issue_type}`}>
              {ticket.issue_type.replace('_', ' ')}
            </span>
            {ticket.order_number && (
              <span className="meta-item">
                📦 Order: <strong>{ticket.order_number}</strong>
              </span>
            )}
            <span className="meta-item">
              👤 Customer: {ticket.customer_name}
            </span>
            <span className="meta-item">
              📅 Created: {new Date(ticket.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="ticket-actions">
          {/* Customer can edit if ticket is still open and not assigned */}
          {!isAgent && ticket.status === 'open' && !ticket.assigned_agent_id && (
            <button 
              onClick={() => navigate(`/tickets/${id}/edit`)}
              className="btn-edit"
            >
              ✏️ Edit Ticket
            </button>
          )}

          {/* Admin-only controls */}
          {isAdmin && (
            <>
              {/* Assign/Reassign Agent Button - Admin only */}
              <button 
                onClick={() => setShowAssignModal(true)}
                className="btn-assign"
              >
                👤 {ticket.assigned_agent_id ? 'Reassign' : 'Assign'}
              </button>

              {/* Status Dropdown */}
              <select 
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </>
          )}

          {/* Agent controls - status only, no reassign */}
          {isAgent && !isAdmin && (
            <select 
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>
      </div>

      <div className="ticket-content">
        <div className="ticket-description">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>

        {/* AI Investigation - Only visible to agents (not admin) */}
        {isAgent && !isAdmin && !investigation && (
          <div className="ai-investigation-section">
            <h3>🤖 AI Investigation</h3>
            <p>Let AI analyze this ticket and provide recommendations based on order and payment data.</p>
            <button 
              onClick={handleInvestigate} 
              disabled={investigating}
              className="btn-investigate"
            >
              {investigating ? '🤖 Investigating...' : '🤖 Run AI Investigation'}
            </button>
          </div>
        )}

        {/* Investigation Results - Only visible to agents (not admin) */}
        {isAgent && !isAdmin && investigation && (
          <div className="investigation-results">
            <h3>🤖 AI Investigation Results</h3>
            
            <div className="ai-response">
              <h4>AI Recommendation</h4>
              <div className="response-content">
                {investigation.response}
              </div>
            </div>

            {investigation.toolsUsed && investigation.toolsUsed.length > 0 && (
              <div className="tools-used">
                <h4>Tools Used</h4>
                {investigation.toolsUsed.map((tool, idx) => (
                  <div key={idx} className="tool-card">
                    <div className="tool-header">
                      <span className="tool-name">{tool.name}</span>
                      <span className="tool-args">
                        {JSON.stringify(tool.arguments)}
                      </span>
                    </div>
                    
                    {investigation.toolResults[idx] && (
                      <div className="tool-result">
                        {renderToolResult(investigation.toolResults[idx])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleInvestigate} 
              className="btn-reinvestigate"
            >
              🔄 Re-run Investigation
            </button>
          </div>
        )}

        {/* Customer view - simplified status display */}
        {!isAgent && (
          <div className="customer-info">
            <div className="info-card">
              <h3>📋 Ticket Status</h3>
              <p className="status-message">
                {ticket.status === 'open' && 'Your ticket has been received and is waiting for an agent to review it.'}
                {ticket.status === 'in_progress' && 'An agent is currently working on your ticket.'}
                {ticket.status === 'resolved' && 'Your ticket has been resolved. If you need further assistance, please create a new ticket.'}
                {ticket.status === 'closed' && 'This ticket is closed.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Assign Agent Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Agent</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="current-assignment">
                <strong>Currently Assigned:</strong> 
                <span>{ticket.agent_name || 'Unassigned'}</span>
              </div>
              
              <h3>Select Agent:</h3>
              <div className="agents-list">
                {agents.map((agent) => (
                  <div 
                    key={agent.id} 
                    className={`agent-item ${ticket.assigned_agent_id === agent.id ? 'selected' : ''}`}
                    onClick={() => handleAssignAgent(agent.id)}
                  >
                    <div className="agent-avatar">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="agent-info">
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-role">{agent.role}</div>
                    </div>
                    {ticket.assigned_agent_id === agent.id && (
                      <span className="check-icon">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderToolResult(toolResult) {
  const { name, result } = toolResult;

  if (!result.success) {
    return <div className="tool-error">❌ {result.error}</div>;
  }

  if (name === 'lookupOrder') {
    return (
      <div className="order-details">
        <div className="detail-row">
          <span className="label">Order Number:</span>
          <span className="value">{result.orderNumber}</span>
        </div>
        <div className="detail-row">
          <span className="label">Status:</span>
          <span className={`value status-${result.status}`}>{result.status}</span>
        </div>
        <div className="detail-row">
          <span className="label">Expected Delivery:</span>
          <span className="value">{new Date(result.expectedDelivery).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Tracking Status:</span>
          <span className="value">{result.trackingStatus}</span>
        </div>
      </div>
    );
  }

  if (name === 'investigatePayments') {
    return (
      <div className="payment-investigation">
        <div className="detail-row">
          <span className="label">Transactions Found:</span>
          <span className="value">{result.transactionsFound}</span>
        </div>
        <div className="detail-row">
          <span className="label">Possible Duplicate:</span>
          <span className={`value ${result.possibleDuplicate ? 'warning' : 'success'}`}>
            {result.possibleDuplicate ? '⚠️ Yes' : '✅ No'}
          </span>
        </div>
        {result.possibleDuplicate && (
          <div className="detail-row">
            <span className="label">Requires Review:</span>
            <span className="value warning">
              {result.requiresHumanReview ? '⚠️ Human review required' : 'No action needed'}
            </span>
          </div>
        )}
        {result.transactions && (
          <div className="transactions-list">
            <strong>Transactions:</strong>
            {result.transactions.map((txn, idx) => (
              <div key={idx} className="transaction-item">
                <span>{txn.transactionReference}</span>
                <span>{txn.currency} {txn.amount}</span>
                <span className={`txn-status-${txn.status}`}>{txn.status}</span>
                <span className="txn-date">{new Date(txn.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <pre>{JSON.stringify(result, null, 2)}</pre>;
}
