import React from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = ({ setCurrentPage }) => {
    const { currentUser, loginWithGoogle, logout } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const [showLoginModal, setShowLoginModal] = React.useState(false);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            setShowLoginModal(false);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("Failed to log in", error);
            alert("Failed to sign in with Google: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setCurrentPage('landing');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="navbar glass-panel">
            <div className="container nav-container">
                <div className="nav-logo" onClick={() => setCurrentPage('landing')}>
                    <div className="logo-icon">
                        <Terminal size={24} color="var(--accent-color)" />
                    </div>
                    <span className="logo-text">In<span className="highlight-text">short</span> Agents</span>
                </div>

                <div className="nav-links desktop">
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('landing'); window.scrollTo(0, 0); }}>Platform</a>
                    <a href="#" className="nav-link-agents" onClick={(e) => { e.preventDefault(); setCurrentPage('agents'); }}><span className="nav-dot"></span> Agents</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('billing'); }}>Pricing</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('partners'); }}>Partners</a>
                </div>

                <div className="nav-actions desktop">
                    {currentUser ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{currentUser.email.charAt(0).toUpperCase()}</div>
                                )}
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentUser.displayName || currentUser.email}</span>
                            </div>
                            <button className="secondary-button" onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
                            <button className="icon-button" onClick={handleLogout} title="Log Out" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}><LogOut size={20} /></button>
                        </div>
                    ) : (
                        <>
                            <button className="secondary-button" onClick={() => setShowLoginModal(true)}>Log In</button>
                            <button className="primary-button" onClick={() => setShowLoginModal(true)}>Get Started Free</button>
                        </>
                    )}
                </div>

                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isOpen && (
                <div className="mobile-menu glass-panel">
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('landing'); setIsOpen(false); }}>Platform</a>
                    <a href="#" className="nav-link-agents" onClick={(e) => { e.preventDefault(); setCurrentPage('agents'); setIsOpen(false); }}><span className="nav-dot"></span> Agents</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('billing'); setIsOpen(false); }}>Pricing</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('partners'); setIsOpen(false); }}>Partners</a>
                    {currentUser ? (
                        <>
                            <button className="primary-button full-width" onClick={() => { setCurrentPage('dashboard'); setIsOpen(false); }}>Dashboard</button>
                            <button className="secondary-button full-width" onClick={() => { handleLogout(); setIsOpen(false); }} style={{ marginTop: '8px' }}>Log Out</button>
                        </>
                    ) : (
                        <button className="primary-button full-width" onClick={() => { setShowLoginModal(true); setIsOpen(false); }}>Log In</button>
                    )}
                </div>
            )}

            {showLoginModal && createPortal(
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 10, 21, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '48px 40px', position: 'relative', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 17, 34, 0.9) 100%)', border: '1px solid rgba(0, 240, 255, 0.2)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 240, 255, 0.1)', borderRadius: '24px' }}>
                        <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onClick={() => setShowLoginModal(false)} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                            <X size={18} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,240,255,0.1), rgba(112,0,255,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Terminal size={32} color="var(--accent-color)" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', margin: '0 0 12px 0' }}>Welcome to Inshort</h2>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem' }}>Create your account to unlock instant GCP provisioning.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', padding: '0 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Dedicate AI Infrastructure
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> 500+ Top-Tier LLM Models
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div> Single Billing Dashboard
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))', padding: '1px', borderRadius: '12px' }}>
                                <button className="secondary-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px', background: 'var(--bg-secondary)', border: 'none', borderRadius: '11px', fontSize: '1.05rem', color: '#fff', transition: 'all 0.3s' }} onClick={handleGoogleLogin} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(10,17,34,0.8)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
                                    Continue with Google
                                </button>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>By continuing, you agree to our <a href="#" style={{ textDecoration: 'underline' }}>Terms of Service</a> and <a href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</a>.</p>
                        </div>
                    </div>
                </div>
                , document.body)}
        </nav>
    );
};

export default Navbar;
