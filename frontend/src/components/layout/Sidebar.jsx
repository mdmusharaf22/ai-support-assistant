import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export default function Sidebar() {
  const { user, isAgent, isAdmin } = useAuth();
  const location = useLocation();
  
  // Custom active check for tickets links
  const isTicketsActive = location.pathname === '/tickets' && !location.search;
  const isAssignedActive = location.pathname === '/tickets' && location.search.includes('assigned=me');
  
  // Determine portal type
  const portalType = isAdmin ? 'Admin Portal' : isAgent ? 'Agent Portal' : 'Customer Portal';
  
  // Determine tickets label
  const ticketsLabel = isAdmin ? 'All Tickets' : 'My Tickets';
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🤖 AI Support</h2>
        <p className="user-role">{portalType}</p>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className="nav-item">
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>
        
        <Link 
          to="/tickets" 
          className={isTicketsActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">🎫</span>
          {ticketsLabel}
        </Link>

        {/* Orders - Only for customers */}
        {!isAgent && (
          <NavLink to="/orders" end className="nav-item">
            <span className="nav-icon">📦</span>
            My Orders
          </NavLink>
        )}
        
        {/* Customers - Only for admin */}
        {isAdmin && (
          <NavLink to="/customers" end className="nav-item">
            <span className="nav-icon">👥</span>
            Customers
          </NavLink>
        )}
        
        <NavLink to="/profile" end className="nav-item">
          <span className="nav-icon">⚙️</span>
          {isAgent ? 'Settings' : 'Profile'}
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
