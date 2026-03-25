import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
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
              <LogIn size={28} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Login to manage your expenses</p>
        </div>

        <form onSubmit={handleSubmit}>
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
            />
          </div>

          {error && <p className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
            {loading ? (
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : 'Sign In'}
          </button>
        </form>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
