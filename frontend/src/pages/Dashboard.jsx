import React, { useState, useEffect } from 'react';
import { PlusCircle, Server, Activity, ShieldCheck, Zap, RefreshCw, Trash2, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AgentWizard from '../components/AgentWizard';
import './Dashboard.css';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Elapsed time display component
const BootTimer = ({ bootStartedAt }) => {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!bootStartedAt) return;
        const start = new Date(bootStartedAt).getTime();
        const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [bootStartedAt]);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return <span>{mins > 0 ? `${mins}m ` : ''}{secs}s</span>;
};

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [agents, setAgents] = useState([]);
    const [isDeleting, setIsDeleting] = useState(null);
    const [isRestarting, setIsRestarting] = useState(null);
    const [isForcing, setIsForcing] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        
        const q = query(collection(db, 'agents'), where('ownerId', '==', currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedAgents = [];
            snapshot.forEach((docSnap) => {
                loadedAgents.push({ id: docSnap.id, ...docSnap.data() });
            });
            setAgents(loadedAgents);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Poll backend health check for any agents currently booting
    useEffect(() => {
        const bootingAgents = agents.filter(a => a.status === 'Active' && a.serviceStatus === 'booting' && a.openClawUrl && !a.openClawUrl.includes('Pending'));
        if (bootingAgents.length === 0) return;

        const checkBootingAgents = () => {
            bootingAgents.forEach(agent => {
                try {
                    const urlObj = new URL(agent.openClawUrl);
                    const ip = urlObj.hostname;
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    fetch(`${apiUrl}/api/status?ip=${ip}&agentId=${agent.id}`).catch(() => {});
                } catch (e) {}
            });
        };

        const intervalId = setInterval(checkBootingAgents, 10000); // Check every 10s (faster than before)
        checkBootingAgents(); // Run immediately
        return () => clearInterval(intervalId);
    }, [agents]);

    const handleDelete = async (agentId, agentName) => {
        if (!window.confirm(`Are you sure you want to permanently delete and deprovision ${agentName}? This action cannot be undone.`)) return;

        setIsDeleting(agentId);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/provision/${agentName}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                await deleteDoc(doc(db, 'agents', agentId));
                alert(`Agent ${agentName} has been successfully destroyed.`);
            } else {
                alert('Deletion failed: ' + data.error);
            }
        } catch (err) {
            alert('Network error during deletion.');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleRestart = async (agentId, agentName) => {
        if (!window.confirm(`Are you sure you want to restart ${agentName}? Your agent will be offline for approximately 30-45 seconds while it fetches a new IP and regenerates SSL certificates.`)) return;

        setIsRestarting(agentId);
        try {
            await updateDoc(doc(db, 'agents', agentId), { status: 'Restarting' });

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/provision/${agentName}/restart`, { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                await updateDoc(doc(db, 'agents', agentId), {
                    openClawUrl: data.urls.openClawUrl,
                    n8nUrl: data.urls.n8nUrl,
                    status: 'Active'
                });
                alert(`Agent ${agentName} successfully restarted. URLs updated.`);
            } else {
                await updateDoc(doc(db, 'agents', agentId), { status: 'Active' });
                alert('Restart failed: ' + data.error);
            }
        } catch (err) {
            await updateDoc(doc(db, 'agents', agentId), { status: 'Active' });
            alert('Network error during restart.');
        } finally {
            setIsRestarting(null);
        }
    };

    const handleForceReady = async (agentId) => {
        setIsForcing(agentId);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/api/provision/${agentId}/force-ready`, { method: 'POST' });
        } catch (err) {
            // Fallback: update Firestore directly
            await updateDoc(doc(db, 'agents', agentId), { serviceStatus: 'ready' });
        } finally {
            setIsForcing(null);
        }
    };

    // Renders the service status section for an agent card
    const renderServiceStatus = (agent) => {
        if (agent.serviceStatus === 'failed') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <AlertTriangle size={14} />
                        <span>Deployment failed — {agent.failReason || 'services did not respond'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-button" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleForceReady(agent.id)} disabled={isForcing === agent.id}>
                            {isForcing === agent.id ? <RefreshCw size={12} className="spinning" /> : '⚡'} Force Ready
                        </button>
                        <a href={agent.openClawUrl} target="_blank" rel="noreferrer" className="url-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '6px' }}>
                            <Server size={12} /> Try Inshort Agent Anyway
                        </a>
                    </div>
                </div>
            );
        }

        if (agent.serviceStatus === 'booting') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '10px 16px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <RefreshCw size={14} className="spinning" />
                        <span>Starting services... <BootTimer bootStartedAt={agent.bootStartedAt || agent.createdAt} /></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Per-service indicators */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: agent.ocReady ? '#10b981' : 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', background: agent.ocReady ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)' }}>
                            {agent.ocReady ? <CheckCircle2 size={10} /> : <RefreshCw size={10} className="spinning" />} Inshort Agent
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: agent.n8nReady ? '#10b981' : 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', background: agent.n8nReady ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)' }}>
                            {agent.n8nReady ? <CheckCircle2 size={10} /> : <RefreshCw size={10} className="spinning" />} n8n
                        </div>
                        <button className="secondary-button" style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleForceReady(agent.id)} disabled={isForcing === agent.id}>
                            {isForcing === agent.id ? <RefreshCw size={10} className="spinning" /> : null} Force Ready
                        </button>
                    </div>
                </div>
            );
        }

        // serviceStatus === 'ready' (or undefined for old agents)
        return (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={agent.openClawUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#3b82f6', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s ease' }} className="url-badge">
                    <Server size={14} /> Inshort Gateway
                </a>
                <a href={agent.n8nUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#f59e0b', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s ease' }} className="url-badge">
                    <Zap size={14} /> n8n Workspace
                </a>
            </div>
        );
    };

    return (
        <div className="dashboard container">
            <aside className="dashboard-sidebar glass-panel">
                <div className="sidebar-group">
                    <h4>Menu</h4>
                    <button
                        className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Activity size={18} /> Overview
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'deploy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('deploy')}
                    >
                        <PlusCircle size={18} /> Deploy New Agent
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'agents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('agents')}
                    >
                        <Server size={18} /> My Agents
                    </button>
                </div>
            </aside>

            <main className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="view-overview fade-in">
                        <h2>Welcome back to Inshort</h2>
                        <p className="subtitle">Manage your deployed agents and view metrics.</p>

                        <div className="stats-grid">
                            <div className="stat-card glass-panel">
                                <h4>Active Agents</h4>
                                <div className="stat-value">{agents.length}</div>
                            </div>
                            <div className="stat-card glass-panel">
                                <h4>Total Requests</h4>
                                <div className="stat-value">0</div>
                            </div>
                            <div className="stat-card glass-panel">
                                <h4>Cloud Cost (MTD)</h4>
                                <div className="stat-value">$4.50</div>
                            </div>
                        </div>

                        {agents.length === 0 ? (
                            <div className="empty-state glass-panel">
                                <Server size={48} color="var(--text-secondary)" />
                                <h3>No Agents Deployed</h3>
                                <p>You haven't provisioned any Inshort agents on GCP yet.</p>
                                <button className="primary-button" onClick={() => setActiveTab('deploy')}>
                                    Deploy Your First Agent
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
                                <h3>Getting Started</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Manage your live instances from the "My Agents" tab.</p>
                                <button className="secondary-button" onClick={() => setActiveTab('agents')}>View Active Agents</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'deploy' && (
                    <div className="view-deploy fade-in">
                        <h2>Deploy New Agent</h2>
                        <p className="subtitle">Configure your Inshort agent's unique requirements.</p>

                        <div className="wizard-wrapper">
                            <AgentWizard />
                        </div>
                    </div>
                )}

                {activeTab === 'agents' && (
                    <div className="view-agents fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2>My Agents</h2>
                                <p className="subtitle">Manage your live SaaS instances.</p>
                            </div>
                            <button className="primary-button" onClick={() => setActiveTab('deploy')}><PlusCircle size={16} /> New Agent</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {agents.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    No active agents found.
                                </div>
                            )}
                            {agents.map(agent => (
                                <div key={agent.id} className="glass-panel agent-card-row">
                                    <div className="agent-card-info">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {agent.agentName}
                                            </h3>
                                            
                                            {/* Status Badge */}
                                            {agent.status === 'Active' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'pulse-glow 2s infinite' }}></span>
                                                    Online
                                                </div>
                                            ) : agent.status === 'Restarting' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    <RefreshCw size={12} className="spinning" />
                                                    Rebooting VM...
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    Offline
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ShieldCheck size={14} color="#10b981" /> Deployed: {new Date(agent.createdAt).toLocaleDateString()}
                                        </div>

                                        {renderServiceStatus(agent)}
                                    </div>

                                    <div className="agent-card-actions">
                                        <div className="agent-specs">
                                            vCPU: 2 • RAM: 4GB<br />
                                            <span style={{ color: '#fff' }}>GCP e2-medium</span>
                                        </div>
                                        <div className="agent-action-buttons">
                                            <button
                                                className="secondary-button icon-btn"
                                                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: (isRestarting === agent.id || isDeleting === agent.id) ? 0.5 : 1 }}
                                                onClick={() => handleRestart(agent.id, agent.agentName)}
                                                disabled={isRestarting === agent.id || isDeleting === agent.id}
                                                title="Hard Restart VM"
                                            >
                                                {isRestarting === agent.id ? <RefreshCw size={14} className="spinning" /> : <Power size={14} />}
                                                Restart
                                            </button>
                                            <button
                                                className="secondary-button icon-btn"
                                                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', opacity: (isRestarting === agent.id || isDeleting === agent.id) ? 0.5 : 1 }}
                                                onClick={() => handleDelete(agent.id, agent.agentName)}
                                                disabled={isRestarting === agent.id || isDeleting === agent.id}
                                                title="Permanently Destroy VM"
                                            >
                                                {isDeleting === agent.id ? <RefreshCw size={14} className="spinning" /> : <Trash2 size={14} />}
                                                Destroy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
