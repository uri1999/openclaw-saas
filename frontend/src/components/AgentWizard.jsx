import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Cpu, Star, Send, MessageSquare, MessageCircle, ChevronDown, ChevronUp, Wand2, Code, TrendingUp, Palette, Trophy, Rocket, Zap, CheckCircle, ShieldCheck } from 'lucide-react';
import './AgentWizard.css';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';

const AgentWizard = () => {
    const { currentUser } = useAuth();
    const [agentCount, setAgentCount] = useState(0);
    const [maxAgents, setMaxAgents] = useState(0); // Default to 0, requires active plan
    const [hasActivePlan, setHasActivePlan] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchUserPlan = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/api/payment/status/${currentUser.uid}`);
                const data = await res.json();
                
                if (data.subscribed) {
                    setMaxAgents(data.agentSlots || 0);
                    setHasActivePlan(true);
                } else {
                    setMaxAgents(0);
                    setHasActivePlan(false);
                }
            } catch (error) {
                console.error("Error fetching user plan:", error);
            }
        };
        
        const fetchAgents = async () => {
            try {
                const q = query(collection(db, 'agents'), where('ownerId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                setAgentCount(querySnapshot.size);
            } catch (error) {
                console.error("Error fetching agents:", error);
            }
        };

        fetchUserPlan();
        fetchAgents();
    }, [currentUser]);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [selectedModel, setSelectedModel] = useState('claude');
    const [selectedChannel, setSelectedChannel] = useState('telegram');
    const [telegramToken, setTelegramToken] = useState('');
    const [showTelegramModal, setShowTelegramModal] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState('personal');

    const getPurpose = (persona) => {
        switch (persona) {
            case 'developer': return 'You are an expert software developer and debugging assistant.';
            case 'finance': return 'You are a financial analyst specializing in market trends and crypto.';
            case 'creative': return 'You are a creative writer and brainstorming partner.';
            case 'sports': return 'You are a sports coach and nutritionist.';
            default: return 'You are a highly capable general personal assistant.';
        }
    };

    const handleDeploy = async () => {
        if (!hasActivePlan) {
            alert('You need an active subscription plan to deploy an agent. Please visit the Billing page to upgrade.');
            return;
        }

        if (agentCount >= maxAgents) {
            alert(`You have reached your plan limit of ${maxAgents} dedicated instance(s). Please upgrade your tier on the Billing page to add more.`);
            return;
        }
        
        // if (!telegramToken) {
        //     alert('A Telegram Bot Token is mandatory to bind your Inshort Agent.');
        //     return;
        // }

        setLoading(true);
        const uniqueId = Date.now().toString(36);
        const payload = {
            agentName: `agent-${selectedPersona}-${uniqueId}`,
            purpose: getPurpose(selectedPersona),
            telegramToken,
            customProvider: 'GEMINI',
            subscriptionPlan: 'kilo-pass'
        };

        let documentId = null;
        try {
            const docRef = await addDoc(collection(db, 'agents'), {
                ownerId: currentUser.uid,
                agentName: payload.agentName,
                openClawUrl: 'Pending...',
                n8nUrl: 'Pending...',
                status: 'PROVISIONING',
                createdAt: new Date().toISOString()
            });
            documentId = docRef.id;
            payload.documentId = documentId;
            setAgentCount(prev => prev + 1); // Optimistic UI update
        } catch (dbError) {
            console.error("Failed to pre-create Firestore document:", dbError);
            alert("Failed to initialize database securely. Please try again.");
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/provision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                setResult(data.agent);
            } else {
                alert('Error: ' + data.error);
                if (documentId) {
                    await deleteDoc(doc(db, 'agents', documentId));
                    setAgentCount(prev => prev - 1);
                }
            }
        } catch (err) {
            console.error("Network error connecting to backend:", err);
            alert('A network timeout occurred, but GCP is likely still provisioning your VM. Check your dashboard shortly.');
            // Note: We deliberately do NOT rollback on network timeout, as the Cloud Run backend often outlives the browser connection.
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        // Mock dual URLs based on the backend response
        const openClawUrl = result.serviceUrl || 'https://t.me/your_new_bot';
        // Extract base IP/domain to build the n8n URL. Fallback to generic if parse fails.
        let n8nUrl = 'http://<your-vm-ip>:5678';
        try {
            if (result.serviceUrl.startsWith('http')) {
                const urlObj = new URL(result.serviceUrl);
                n8nUrl = `http://${urlObj.hostname}:5678`;
            } else {
                n8nUrl = `http://${result.instanceName}.inshort.live:5678`;
            }
        } catch (e) { }


        return (
            <div className="wizard glass-panel success-view fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="success-icon-wrapper" style={{ display: 'inline-block', background: 'var(--accent-glow)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
                    <CheckCircle size={64} color="var(--accent-color)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Infrastructure Provisioned!</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 12px', borderRadius: '20px', marginBottom: '24px' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>SSL Encrypted</span>
                </div>
                <p className="subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Your dedicated Unified VM is now LIVE with automatic HTTPS via Caddy.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
                    {/* Inshort Gateway */}
                    <div className="service-url" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18} color="#3b82f6" />
                            <span className="label" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Inshort Gateway</span>
                            <ShieldCheck size={14} color="#10b981" style={{ marginLeft: 'auto' }} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Direct access to your AI Agent via Telegram.</p>
                        <a href={openClawUrl} target="_blank" rel="noreferrer" style={{ marginTop: '8px', color: '#3b82f6', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem', display: 'inline-block', width: 'fit-content' }}>
                            {openClawUrl}
                        </a>
                    </div>

                    {/* n8n Workspace */}
                    <div className="service-url" style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={18} color="#f59e0b" />
                            <span className="label" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>n8n Automation Workspace</span>
                            <ShieldCheck size={14} color="#10b981" style={{ marginLeft: 'auto' }} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Visual node editor for workflows, bridged to Inshort Agent.</p>
                        <a href={n8nUrl} target="_blank" rel="noreferrer" style={{ marginTop: '8px', color: '#f59e0b', textDecoration: 'none', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem', display: 'inline-block', width: 'fit-content' }}>
                            {n8nUrl}
                        </a>
                    </div>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <button className="deploy-action-btn" onClick={() => setResult(null)}>
                        Deploy Another Instance
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="minimalist-wizard fade-in">
            <div className="wizard-section">
                <label className="section-label">AI Intelligence Core</label>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Star size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>Free Inference Powered by Gemini & Claude</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Your agent instance comes fully pre-loaded with free inference from top-notch AI models like Gemini and Claude included out-of-the-box.</div>
                    </div>
                </div>
            </div>

            <div className="wizard-section" style={{ marginTop: '32px' }}>
                {/* Telegram Identity Configuration Omitted for Compliance */}

                <div className="token-input-container fade-in" style={{ padding: '20px', marginTop: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px' }}>
                            <Zap size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '8px' }}>Single-VM Unified Architecture</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px' }}>
                                Deploying this agent will automatically provision a **Single GCP VM** containing both your Inshort Agent core and a dedicated **n8n Workspace**. They are securely bridged via webhooks by default.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Unified Compute</span>
                                <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Dual Dashboards</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showTelegramModal && createPortal(
                <div className="telegram-modal-overlay fade-in">
                    <div className="telegram-modal bounce-in">
                        <button className="tm-close-btn" onClick={() => setShowTelegramModal(false)}>✕</button>
                        <div className="tm-content">
                            <div className="tm-left">
                                <div className="tm-header">
                                    <div className="tm-icon-bg">
                                        <Send size={24} color="#fff" fill="#fff" />
                                    </div>
                                    <h2>Connect Telegram</h2>
                                </div>
                                <p className="tm-subtitle">How to get your bot token?</p>

                                <div className="tm-instructions">
                                    <div className="tm-step">
                                        <div className="step-num">1</div>
                                        <p>Open Telegram and go to <a href="https://t.me/BotFather" target="_blank" rel="noreferrer">@BotFather</a>.</p>
                                    </div>
                                    <div className="tm-step">
                                        <div className="step-num">2</div>
                                        <p>Start a chat and type <code>/newbot</code>.</p>
                                    </div>
                                    <div className="tm-step">
                                        <div className="step-num">3</div>
                                        <p>Follow the prompts to name your bot and choose a username.</p>
                                    </div>
                                    <div className="tm-step">
                                        <div className="step-num">4</div>
                                        <p>BotFather will send you a message with your bot token. Copy the entire token (it looks like a long string of numbers and letters).</p>
                                    </div>
                                    <div className="tm-step">
                                        <div className="step-num">5</div>
                                        <p>Paste the token in the field below and click Save & Connect.</p>
                                    </div>
                                </div>

                                <div className="tm-form">
                                    <label>ENTER BOT TOKEN</label>
                                    <input
                                        type="password"
                                        className="tm-input"
                                        placeholder="1234567890:ABCdefGHIJklmNOPqrsTUVwxyz"
                                        value={telegramToken}
                                        onChange={(e) => setTelegramToken(e.target.value)}
                                    />
                                    <button className="tm-save-btn" onClick={() => setShowTelegramModal(false)}>
                                        Save & Connect <span style={{ marginLeft: '4px' }}>✓</span>
                                    </button>
                                </div>
                            </div>

                            <div className="tm-right">
                                <div className="phone-mockup">
                                    <div className="phone-notch"></div>
                                    <div className="phone-status">
                                        <span>9:41</span>
                                        <div className="phone-icons">
                                            <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M7 10L14 0H0L7 10Z" fill="white" /></svg>
                                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><rect width="14" height="10" rx="2" fill="white" /><path d="M16 3V7C16 7.55228 15.5523 8 15 8V2C15.5523 2 16 2.44772 16 3Z" fill="white" /></svg>
                                        </div>
                                    </div>

                                    <div className="phone-search">
                                        <div className="search-box">
                                            <span style={{ opacity: 0.5 }}>⚲</span>
                                            <span>Botfather</span>
                                            <span className="search-clear">x</span>
                                        </div>
                                    </div>

                                    <div className="phone-results">
                                        <div className="results-label">GLOBAL SEARCH</div>
                                        <div className="res-item active">
                                            <div className="res-avatar blue"><Send size={14} color="#fff" fill="#fff" /></div>
                                            <div className="res-info">
                                                <div className="res-title">BotFather <CheckCircle size={10} color="#3b82f6" fill="#3b82f6" style={{ marginLeft: '4px' }} /></div>
                                                <div className="res-handle">@BotFather</div>
                                            </div>
                                        </div>
                                        <div className="res-item">
                                            <div className="res-avatar purple">B</div>
                                            <div className="res-info">
                                                <div className="res-title">Botfather Guide</div>
                                                <div className="res-handle">@BotFatherGuide_bot</div>
                                            </div>
                                        </div>
                                        <div className="res-item">
                                            <div className="res-avatar green">B</div>
                                            <div className="res-info">
                                                <div className="res-title">BotFather Tools</div>
                                                <div className="res-handle">@BFTools_bot</div>
                                            </div>
                                        </div>
                                        <div className="res-item">
                                            <div className="res-avatar orange">B</div>
                                            <div className="res-info">
                                                <div className="res-title">Bot Helper</div>
                                                <div className="res-handle">@bothelper_bot</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="advanced-accordion" style={{ marginTop: '32px' }}>
                <div className="accordion-header" onClick={() => setShowAdvanced(!showAdvanced)}>
                    <span>Advanced Configuration</span>
                    {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {showAdvanced && (
                    <div className="accordion-body fade-in">
                        <label className="section-label" style={{ marginBottom: '16px' }}>What kind of assistant?</label>
                        <div className="persona-grid">
                            <div className={`persona-card ${selectedPersona === 'personal' ? 'selected' : ''}`} onClick={() => setSelectedPersona('personal')}>
                                <Wand2 size={24} color={selectedPersona === 'personal' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                                <div>
                                    <h4>Personal Assistant <span className="recommended-badge">RECOMMENDED</span></h4>
                                    <p>Best for multiple use cases: productivity, research, organization</p>
                                </div>
                            </div>

                            <div className="persona-row">
                                <div className={`persona-card small ${selectedPersona === 'developer' ? 'selected' : ''}`} onClick={() => setSelectedPersona('developer')}>
                                    <Code size={20} color={selectedPersona === 'developer' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                                    <div>
                                        <h4>Developer</h4>
                                        <p>Code help & debugging</p>
                                    </div>
                                </div>
                                <div className={`persona-card small ${selectedPersona === 'finance' ? 'selected' : ''}`} onClick={() => setSelectedPersona('finance')}>
                                    <TrendingUp size={20} color={selectedPersona === 'finance' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                                    <div>
                                        <h4>Finance & Markets</h4>
                                        <p>Stocks, crypto & analysis</p>
                                    </div>
                                </div>
                                <div className={`persona-card small ${selectedPersona === 'creative' ? 'selected' : ''}`} onClick={() => setSelectedPersona('creative')}>
                                    <Palette size={20} color={selectedPersona === 'creative' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                                    <div>
                                        <h4>Creative Writer</h4>
                                        <p>Writing & brainstorming</p>
                                    </div>
                                </div>
                                <div className={`persona-card small ${selectedPersona === 'sports' ? 'selected' : ''}`} onClick={() => setSelectedPersona('sports')}>
                                    <Trophy size={20} color={selectedPersona === 'sports' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                                    <div>
                                        <h4>Sports & Health</h4>
                                        <p>Coaching, stats & nutrition</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="org-block" style={{ marginTop: '40px' }}>
                <div className="org-avatar">{currentUser?.displayName?.[0] || 'U'}</div>
                <div className="org-info">
                    <div className="org-name">Agents <span className="exit-icon" style={{ cursor: 'pointer' }}>↪</span></div>
                    <div className="org-email">{currentUser?.email || 'agents@inshort.live'}</div>
                </div>
                <div style={{ marginLeft: 'auto', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
                    Quota: {agentCount} / {maxAgents}
                </div>
            </div>

            <button className="deploy-action-btn" onClick={handleDeploy} disabled={loading || agentCount >= maxAgents}>
                {loading ? <div className="spinner" style={{ borderColor: 'transparent', borderTopColor: '#fff', width: '18px', height: '18px', borderWidth: '2px', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Rocket size={18} color="var(--text-secondary)" />}
                {loading ? 'Deploying...' : (agentCount >= maxAgents ? 'Limit Reached' : 'Deploy')}
            </button>

        </div>
    );
};

export default AgentWizard;
