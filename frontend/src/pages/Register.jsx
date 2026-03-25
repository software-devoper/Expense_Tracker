import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await register(name, email, password);
      setSuccessMsg(response.message || 'Registration successful. Please check your email to verify your account.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem 2rem', maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--accent)', padding: '1rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
              <UserPlus size={28} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Start tracking your expenses</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength="6"
            />
          </div>

          {error && <p className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
          {successMsg && <p style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{successMsg}</p>}

          {!successMsg && (
            <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : 'Sign Up'}
            </button>
          )}
        </form>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
