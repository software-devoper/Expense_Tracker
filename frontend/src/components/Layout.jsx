import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, PieChart, Settings as SettingsIcon, LogOut, UploadCloud, Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    
    // Check initial mobile state
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDark(newTheme === 'dark');
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Upload Receipt', path: '/upload', icon: <UploadCloud size={20} /> },
    { label: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    { label: 'Reports', path: '/reports', icon: <PieChart size={20} /> },
    { label: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
    closed: { x: '-100%', transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  return (
    <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* Mobile Top App Bar */}
      <AnimatePresence>
        {isMobile && (
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, height: '64px', 
              backgroundColor: 'var(--bg-secondary)', zIndex: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
              <Receipt size={24} /> <span style={{ fontSize: '1.25rem' }}>Expensify</span>
            </div>
            <button 
              onClick={() => setIsMobileOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
            >
              <Menu size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Blurred Overlay */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* The Sidebar Panel */}
      <AnimatePresence mode="wait">
        {(!isMobile || isMobileOpen) && (
          <motion.aside
            key="sidebar"
            variants={sidebarVariants}
            initial={isMobile ? "closed" : false}
            animate="open"
            exit="closed"
            className="glass-panel"
            style={{ 
              width: '280px', 
              margin: isMobile ? '0' : '1rem', 
              padding: '1.5rem', 
              display: 'flex', flexDirection: 'column', 
              borderRadius: isMobile ? '0 16px 16px 0' : '16px', 
              position: 'fixed', bottom: 0, top: 0, 
              height: isMobile ? '100vh' : 'calc(100vh - 2rem)',
              zIndex: 50,
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.1)' : '0 8px 32px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={24} /> Expensify
              </h2>
              {isMobile && (
                <button 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }} 
                  onClick={closeMobileMenu}
                >
                  <X size={24} />
                </button>
              )}
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={isMobile ? { x: -20, opacity: 0 } : false}
                    animate={isMobile ? { x: 0, opacity: 1 } : false}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link 
                      to={item.path} 
                      onClick={closeMobileMenu}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', 
                        borderRadius: '12px', color: isActive ? '#fff' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                        textDecoration: 'none', fontWeight: isActive ? '600' : '500',
                        transition: 'all 0.2s ease',
                      }}
                      className={!isActive ? 'hover-bg' : ''}
                    >
                      {item.icon} {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div 
              initial={isMobile ? { y: 20, opacity: 0 } : false}
              animate={isMobile ? { y: 0, opacity: 1 } : false}
              transition={{ delay: 0.3 }}
              style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={toggleTheme} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', fontSize: '0.75rem' }} title="Toggle Theme">
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Light' : 'Dark'}
                </button>
                <button onClick={logout} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <LogOut size={16} /> Exit
                </button>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main App Content Viewport */}
      <main className="content-area" style={{ 
        marginLeft: isMobile ? '0' : 'calc(280px + 2rem)', 
        flex: 1, 
        padding: isMobile ? '6rem 1rem 2rem 1rem' : '2rem 2rem 2rem 0', 
        width: '100%',
        minHeight: '100vh',
        transition: 'padding 0.3s ease, margin-left 0.3s ease' 
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <style>{`
        .hover-bg:hover { background-color: rgba(99, 102, 241, 0.08); color: var(--text-primary) !important; }
      `}</style>
    </div>
  );
};

export default Layout;
