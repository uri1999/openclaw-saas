import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Users, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';
import './Partners.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://openclaw-saas-backend-774090439292.us-central1.run.app';

const Partners = ({ setCurrentPage }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [partnerData, setPartnerData] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        fetchPartnerStats();
    }, [currentUser]);

    const fetchPartnerStats = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/partner/stats/${currentUser.uid}`);
            const data = await res.json();
            if (data && data.isPartner) {
                setPartnerData(data);
            }
        } catch (err) {
            console.error('Failed to fetch partner stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setRegistering(true);
            const res = await fetch(`${API_BASE}/api/partner/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: currentUser.uid })
            });
            const data = await res.json();
            if (data.success) {
                fetchPartnerStats();
            }
        } catch (err) {
            console.error('Failed to register as partner', err);
            alert("Failed to activate partner account.");
        } finally {
            setRegistering(false);
        }
    };

    const handleCopy = () => {
        if (!partnerData) return;
        const link = `https://agents.inshort.live/?ref=${partnerData.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="partners-page centered">
                <RefreshCw size={32} className="spinning" color="var(--accent-color)" />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading partner data...</p>
            </div>
        );
    }

    if (!partnerData) {
        return (
            <div className="partners-page fade-in">
                <div className="container partners-welcome">
                    <div className="bento-item glass-panel welcome-card">
                        <h1>Inshort Affiliate Program</h1>
                        <p className="subtitle">Earn a <strong>20% recurring commission</strong> on every active instance you refer.</p>
                        
                        <div className="benefits-grid">
                            <div className="benefit">
                                <DollarSign size={24} color="#10b981" />
                                <h3>20% Month-over-Month</h3>
                                <p>As long as they stay subscribed, you keep earning.</p>
                            </div>
                            <div className="benefit">
                                <Users size={24} color="#3b82f6" />
                                <h3>Unlimited Referrals</h3>
                                <p>No earning caps. More referrals equals more passive income.</p>
                            </div>
                        </div>

                        <button 
                            className="primary-button cta-btn" 
                            onClick={handleRegister} 
                            disabled={registering}
                        >
                            {registering ? 'Activating...' : 'Become a Partner'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const referralLink = `https://agents.inshort.live/?ref=${partnerData.referralCode}`;

    return (
        <div className="partners-page fade-in">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Partner Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Manage your referrals and view earnings.</p>
                    </div>
                </div>

                <div className="referral-link-section glass-panel bento-item">
                    <h3>Your Unique Referral Link</h3>
                    <p>Share this link to start earning commissions. Anyone who signs up via this link will be permanently attributed to you.</p>
                    
                    <div className="link-box">
                        <code className="link-text">{referralLink}</code>
                        <button className="copy-btn" onClick={handleCopy}>
                            {copied ? 'Copied!' : <><Copy size={16} /> Copy</>}
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card glass-panel bento-item">
                        <div className="stat-header">
                            <h3>Total Referrals</h3>
                            <Users size={20} color="#3b82f6" />
                        </div>
                        <p className="stat-value">{partnerData.metrics.totalReferrals}</p>
                        <p className="stat-desc">Users who signed up using your link.</p>
                    </div>

                    <div className="stat-card glass-panel bento-item">
                        <div className="stat-header">
                            <h3>Pending Earnings</h3>
                            <DollarSign size={20} color="#f59e0b" />
                        </div>
                        <p className="stat-value">${partnerData.metrics.pendingEarnings.toFixed(2)}</p>
                        <p className="stat-desc">Commissions awaiting monthly payout.</p>
                    </div>

                    <div className="stat-card glass-panel bento-item">
                        <div className="stat-header">
                            <h3>Total Paid</h3>
                            <DollarSign size={20} color="#10b981" />
                        </div>
                        <p className="stat-value">${partnerData.metrics.totalEarnings.toFixed(2)}</p>
                        <p className="stat-desc">Lifetime commissions successfully transferred.</p>
                    </div>
                </div>

                <div className="payout-notice">
                    <p><strong>Note:</strong> Payouts are calculated at the end of each month. To request a payout for your pending earnings, please email <strong>admin@inshort.live</strong> from your registered email address.</p>
                </div>
            </div>
        </div>
    );
};

export default Partners;
