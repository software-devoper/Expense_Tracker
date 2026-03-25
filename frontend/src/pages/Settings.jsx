import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account and app preferences.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <User size={20} color="var(--accent)" /> Profile Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="input-field" defaultValue={user?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="input-field" defaultValue={user?.email || ''} disabled />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Bell size={20} color="var(--accent)" /> Notification Preferences
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span style={{ color: 'var(--text-primary)' }}>Email reminders for unpaid bills</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked />
            <span style={{ color: 'var(--text-primary)' }}>Calendar event sync</span>
          </label>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Shield size={20} color="var(--accent)" /> Security
        </h3>
        <button className="btn-secondary" style={{ width: 'auto' }}>Change Password</button>
      </div>

    </div>
  );
};

export default Settings;
