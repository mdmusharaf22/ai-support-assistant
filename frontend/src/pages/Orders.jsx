import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p className="subtitle">View and manage your orders</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          + Place New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="empty-title">No orders yet</p>
          <p className="empty-text">Place your first order to get started</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
          >
            Place Order
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>{order.order_number}</h3>
                  <span className="order-date">
                    {new Date(order.ordered_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`status-badge status-${order.status}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Expected Delivery:</span>
                  <span className="value">
                    {new Date(order.expected_delivery_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Tracking:</span>
                  <span className="value">{order.tracking_status}</span>
                </div>
                <div className="detail-row payment-info">
                  <span className="label">💳 Payment:</span>
                  <span className="value">TXN-{order.order_number.split('-')[1]}</span>
                </div>
              </div>

              <div className="order-actions">
                <Link 
                  to={`/tickets/new?orderId=${order.id}&orderNumber=${order.order_number}&issueType=order_issue`}
                  className="btn-create-ticket btn-order"
                >
                  📦 Order Issue
                </Link>
                <Link 
                  to={`/tickets/new?orderId=${order.id}&orderNumber=${order.order_number}&issueType=payment_issue`}
                  className="btn-create-ticket btn-payment"
                >
                  💳 Payment Issue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateOrderModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadOrders();
          }}
        />
      )}
    </div>
  );
}

function CreateOrderModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 1,
    price: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.price) {
      toast.error('Please fill in all fields');
      return;
    }

    const totalAmount = parseFloat(formData.price) * parseInt(formData.quantity);

    setLoading(true);
    try {
      await orderService.createOrder({
        items: [{
          name: formData.productName,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price)
        }],
        totalAmount
      });
      
      toast.success('Order placed successfully!');
      onSuccess();
    } catch (err) {
      toast.error('Failed to create order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Place New Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
              placeholder="e.g., Laptop, Phone, Headphones"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="1999.00"
                required
              />
            </div>
          </div>

          <div className="total-amount">
            <span>Total Amount:</span>
            <strong>₹{(parseFloat(formData.price || 0) * parseInt(formData.quantity || 1)).toFixed(2)}</strong>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
