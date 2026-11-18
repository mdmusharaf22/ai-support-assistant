import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

export default function Profile() {
  const { user, isAgent } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setLoadingProfile(true);
    try {
      const response = await api.put('/auth/profile', {
        name: formData.name
      });
      
      // Update user in localStorage
      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('✅ Profile updated successfully!');
      
      // Reload page to update sidebar
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      toast.error(errorMsg);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('All fields are required');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoadingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('🔒 Password changed successfully!');
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>⚙️ {isAgent ? 'Settings' : 'Profile'}</h1>
        <p className="subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="profile-container">
        {/* Profile Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <span className="role-badge">{user?.role?.toUpperCase()}</span>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                disabled
              />
              <small className="helper-text">Email cannot be changed</small>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loadingProfile}
            >
              {loadingProfile ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 8 characters)"
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={loadingPassword}
            >
              {loadingPassword ? '🔒 Changing...' : '🔒 Change Password'}
            </button>
          </form>
        </div>

        {/* Account Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Account Information</h2>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">User ID</span>
              <span className="info-value">{user?.id}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-value">{user?.role}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Account Status</span>
              <span className="info-value status-active">✅ Active</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
