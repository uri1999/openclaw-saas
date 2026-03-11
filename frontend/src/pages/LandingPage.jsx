import React, { useState } from 'react';
import { Bot, Zap, Shield, ArrowRight, Server, Infinity, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import './LandingPage.css';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = ({ setCurrentPage }) => {
    const { currentUser, loginWithGoogle } = useAuth();
    const [isYearly, setIsYearly] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);

    const handleGetStarted = async () => {
        if (currentUser) {
            setCurrentPage('dashboard');
        } else {
            try {
                await loginWithGoogle();
                setCurrentPage('dashboard');
            } catch (error) {
                console.error("Login failed", error);
            }
        }
    };

    return (
        <div className="landing-page">
            <section className="hero-section">
                <div className="container hero-container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '60px', paddingBottom: '40px' }}>
                    <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '30px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                        <span className="sparkle">✨</span> <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>v1.0 is live</span>
                    </div>

                    <h1 className="hero-title" style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '24px' }}>
                        OpenClaw + Hosted n8n,<br /><span className="highlight-text">Live in 60s.</span>
                    </h1>

                    <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Deploy autonomous AI agents with full computer access. Each instance comes pre-configured with OpenClaw and n8n on a dedicated Google Cloud VM.
                    </p>

                    <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        <button className="primary-button hero-btn" onClick={handleGetStarted} style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                            Start Deploying Free <ArrowRight size={20} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                        </button>
                    </div>
                </div>
            </section>

            <section className="features-section" style={{ padding: '60px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Built for Scale and Autonomy</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Everything you need to run AI agents safely.</p>
                    </div>

                    <div className="bento-grid">
                        <div className="feature-card glass-panel bento-item bento-large" style={{ padding: '40px', background: 'linear-gradient(145deg, rgba(15,23,42,0.8) 0%, rgba(10,17,34,0.4) 100%)' }}>
                            <div className="feature-icon" style={{ marginBottom: '20px' }}><Server size={32} color="var(--accent-color)" /></div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Zero-Touch GCP Provisioning</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>We handle the infrastructure. Every agent runs on a dedicated, secure e2-medium instance. No Docker knowledge or cloud configuration required.</p>
                        </div>

                        <div className="feature-card glass-panel bento-item" style={{ padding: '40px' }}>
                            <div className="feature-icon" style={{ marginBottom: '20px' }}><Zap size={32} color="#f59e0b" /></div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Bundled n8n Hosting</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Connect your agent to 1000+ apps. Your dedicated n8n instance is pre-authenticated and wired directly to your OpenClaw agent for instant automation.</p>
                        </div>

                        <div className="feature-card glass-panel bento-item" style={{ padding: '40px' }}>
                            <div className="feature-icon" style={{ marginBottom: '20px' }}><Shield size={32} color="#10b981" /></div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Secure by Default</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Agents operate in strict silos. We automatically provision HTTPS certificates via Caddy and enforce firewall rules so your data and webhooks are encrypted end-to-end.</p>
                        </div>

                        <div className="feature-card glass-panel bento-item bento-large" style={{ padding: '40px' }}>
                            <div className="feature-icon" style={{ marginBottom: '20px' }}><Infinity size={32} color="var(--accent-secondary)" /></div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>500+ Frontier Models</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>Choose your brain. Pre-configured with OpenRouter, you can swap between Gemini 1.5 Pro, GPT-4o, Claude 3.5 Sonnet, or open-source local models instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Wall of Love */}
            <section className="testimonials-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'rgba(5, 10, 21, 0.4)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Founders are scaling with OpenClaw</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Join founders and professionals automating their infrastructure.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                        {[
                            { name: '@jonahships_', text: 'Setup OpenClaw yesterday. All I have to say is, wow. The fact that it can just browse the web while I sleep is crazy.' },
                            { name: '@davemorin', text: 'First time I have felt like I am living in the future. Just told my agent to build an automation and it did it in n8n in 60 seconds.' },
                            { name: '@therno', text: 'It\'s literally running my infrastructure. Customer success, data scraping, and PR reviews. Best $49 I spend every month.' },
                            { name: '@nateliason', text: 'Yeah this was 1,000% worth it. It autonomously built a web scraper for me.' },
                            { name: '@nickvasiles', text: 'A 24/7 VM with access to its own computer. It handles all the tedious infrastructure I used to dread.' },
                            { name: '@lycfyi', text: 'After years of AI hype, I finally found something useful. The endgame of agentic infrastructure is here.' }
                        ].map((t, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))' }}></div>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" style={{ padding: '80px 0', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(112,0,255,0.1) 0%, transparent 60%)', zIndex: -1 }}></div>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Transparent, Scalable Pricing</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px' }}>Stop paying separately for AI wrappers and VPS hosting.</p>

                        <div className="pricing-toggle">
                            <button className={!isYearly ? 'active' : ''} onClick={() => setIsYearly(false)}>Monthly</button>
                            <button className={isYearly ? 'active' : ''} onClick={() => setIsYearly(true)}>
                                Yearly <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '4px' }}>-20%</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                        
                        {/* Starter Tier */}
                        <div className="glass-panel bento-item" style={{ padding: '40px', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.6)' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Starter</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Perfect for individual operators.</p>
                            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'flex-end', color: '#fff' }}>
                                ${isYearly ? Math.round(49 * 0.8) : 49}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1 }}>
                                {[
                                    '1 Dedicated OpenClaw VM', 
                                    'Dedicated Core Instance',
                                    /* 'Telegram Integration', */
                                    '500+ Daily Requests'
                                ].map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#fff' }}>
                                        <CheckCircle2 size={16} color="var(--accent-secondary)" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="secondary-button" onClick={handleGetStarted} style={{ width: '100%' }}>Deploy Starter Instance</button>
                        </div>

                        {/* Pro Tier (Popular) */}
                        <div className="glass-panel bento-item" style={{ padding: '40px', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-color)', position: 'relative', background: 'rgba(15, 23, 42, 0.8)' }}>
                            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }} className="badge-limited">Most Popular</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Pro</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Build multi-agent workflows.</p>
                            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'flex-end', color: 'var(--accent-color)' }}>
                                ${isYearly ? Math.round(79 * 0.8) : 79}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1 }}>
                                {[
                                    '2 Dedicated OpenClaw VMs', 
                                    '2 Bundled n8n Workspaces', 
                                    /* 'Telegram + WhatsApp Integration', */
                                    'Priority Scaling'
                                ].map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#fff' }}>
                                        <CheckCircle2 size={16} color="var(--accent-color)" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="primary-button" onClick={handleGetStarted} style={{ width: '100%' }}>Deploy Pro Fleet</button>
                        </div>

                        {/* Elite Tier */}
                        <div className="glass-panel bento-item" style={{ padding: '40px', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.6)' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Enterprise</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For scaling autonomous organizations.</p>
                            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'flex-end', color: '#fff' }}>
                                ${isYearly ? Math.round(99 * 0.8) : 99}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1 }}>
                                {[
                                    '3 Dedicated OpenClaw VMs', 
                                    '3 Bundled n8n Workspaces', 
                                    'Unlimited AI requests', 
                                    'Custom Sandbox Integrations'
                                ].map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#fff' }}>
                                        <CheckCircle2 size={16} color="var(--accent-secondary)" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="secondary-button" onClick={handleGetStarted} style={{ width: '100%' }}>Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>About OpenClaw SaaS</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '24px' }}>
                            We noticed a trend: builders were spending hours trying to wrangle GCP, Docker, and n8n just to get a single multi-modal agent running.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            That's why we built this SaaS. With one click, you get an isolated, secure VM with OpenClaw and n8n perfectly configured. Because you should be building agentic workflows, not fighting with server deployments.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" style={{ padding: '80px 0', background: 'rgba(10, 17, 34, 0.4)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Frequently Asked Questions</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Everything you need to know about the product and billing.</p>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {[
                            { q: 'What exactly gets deployed?', a: 'A dedicated e2-medium Google Cloud VM running OpenClaw, Caddy for reverse proxy, and n8n for workflows.' },
                            { q: 'How long does it take?', a: 'Less than 60 seconds. The VM spins up, fetches a public IP, registers SSL certificates, and boots the Docker containers automatically.' },
                            { q: 'Is my instance secure?', a: 'Yes. Each user gets their own isolated VM behind Google\'s firewall. Only you can access your n8n workflows and OpenClaw logs.' },
                            { q: 'Can I choose my AI model?', a: 'We bundle OpenRouter integration by default, which gives you access to hundreds of models including GPT-4o, Claude 3.5, and Llama 3.' },
                            { q: 'How do I cancel a deployed agent?', a: 'You can destroy a VM at any time from your dashboard. The billing is prorated and the VM is permanently deleted.' }
                        ].map((faq, index) => (
                            <div key={index} style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingBottom: '16px' }}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '16px 0', textAlign: 'left', cursor: 'pointer', border: 'none' }}
                                >
                                    {faq.q}
                                    {openFaq === index ? <ChevronUp size={20} color="var(--accent-color)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                                </button>
                                {openFaq === index && (
                                    <div style={{ animation: 'fadeIn 0.3s ease-in-out', marginTop: '8px' }}>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, paddingBottom: '16px', margin: 0 }}>
                                            {faq.a}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
