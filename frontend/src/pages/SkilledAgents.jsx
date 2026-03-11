import React from 'react';
import { Sparkles, Rocket, Calendar, Droplets, FileText, Presentation, Newspaper, BrainCircuit, HeartPulse, ShoppingCart, GraduationCap, Mic, ArrowRight, Bot, Zap, Shield } from 'lucide-react';
import './SkilledAgents.css';

const AGENTS = [
    {
        icon: Calendar,
        iconBg: 'rgba(59, 130, 246, 0.1)',
        iconBorder: 'rgba(59, 130, 246, 0.2)',
        iconColor: '#3b82f6',
        gradient: 'agent-card-gradient-1',
        title: 'Birthday & Anniversary Reminder',
        description: 'Never miss a special day again. This agent tracks birthdays, anniversaries, and milestones across your contacts — and can auto-call or send personalized messages on the day.',
        features: ['Auto-Calls', 'WhatsApp/Telegram', 'Contact Sync', 'Custom Messages'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: Droplets,
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconBorder: 'rgba(16, 185, 129, 0.2)',
        iconColor: '#10b981',
        gradient: 'agent-card-gradient-2',
        title: 'Health & Pill Reminder',
        description: 'Stay on top of medication schedules and hydration goals. Sends gentle voice or text nudges to drink water, take pills, or log meals at the right times.',
        features: ['Pill Scheduler', 'Water Tracker', 'Voice Nudges', 'Health Log'],
        badge: 'Popular',
        badgeColor: '#10b981',
    },
    {
        icon: FileText,
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconBorder: 'rgba(245, 158, 11, 0.2)',
        iconColor: '#f59e0b',
        gradient: 'agent-card-gradient-3',
        title: 'Document & Video Summarizer',
        description: 'Send any long PDF, article URL, or YouTube video link — get a crisp, actionable summary in seconds. Perfect for busy professionals who need to extract insights fast.',
        features: ['PDF Summary', 'YouTube Digest', 'Article Extract', 'Key Takeaways'],
        badge: 'High Demand',
        badgeColor: '#f59e0b',
    },
    {
        icon: Presentation,
        iconBg: 'rgba(168, 85, 247, 0.1)',
        iconBorder: 'rgba(168, 85, 247, 0.2)',
        iconColor: '#a855f7',
        gradient: 'agent-card-gradient-5',
        title: 'Presentation Maker',
        description: 'Turn a topic, brief, or raw notes into a polished slide deck. Generates structured presentations with key points, data visualizations, and speaker notes automatically.',
        features: ['Auto Slides', 'Speaker Notes', 'Data Viz', 'Export PDF/PPTX'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: Newspaper,
        iconBg: 'rgba(236, 72, 153, 0.1)',
        iconBorder: 'rgba(236, 72, 153, 0.2)',
        iconColor: '#ec4899',
        gradient: 'agent-card-gradient-6',
        title: 'Daily News Briefing',
        description: 'Wake up to a personalized news digest every morning. Covers your selected topics — finance, tech, sports, politics — delivered as a concise voice or text briefing.',
        features: ['Morning Brief', 'Topic Filters', 'Audio Mode', 'Source Links'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: ShoppingCart,
        iconBg: 'rgba(239, 68, 68, 0.1)',
        iconBorder: 'rgba(239, 68, 68, 0.2)',
        iconColor: '#ef4444',
        gradient: 'agent-card-gradient-4',
        title: 'Price Drop & Deal Hunter',
        description: 'Track product prices across Amazon, Flipkart, and more. Get instant alerts when prices drop below your threshold or when flash deals match your wishlist.',
        features: ['Price Tracking', 'Drop Alerts', 'Multi-Platform', 'Wishlist Sync'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: GraduationCap,
        iconBg: 'rgba(59, 130, 246, 0.1)',
        iconBorder: 'rgba(59, 130, 246, 0.2)',
        iconColor: '#3b82f6',
        gradient: 'agent-card-gradient-1',
        title: 'Study & Exam Prep Coach',
        description: 'An AI tutor that creates flashcards, practice questions, and study schedules from your textbooks and notes. Adapts difficulty based on your performance.',
        features: ['Flashcards', 'Quiz Engine', 'Study Plan', 'Progress Track'],
        badge: 'Students',
        badgeColor: '#3b82f6',
    },
    {
        icon: HeartPulse,
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconBorder: 'rgba(16, 185, 129, 0.2)',
        iconColor: '#10b981',
        gradient: 'agent-card-gradient-2',
        title: 'Fitness & Workout Planner',
        description: 'Generates personalized workout routines, tracks calories, and provides real-time coaching tips. Syncs with your goals — weight loss, muscle gain, or endurance.',
        features: ['Custom Plans', 'Calorie Track', 'Progress Photos', 'Voice Coach'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: Mic,
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconBorder: 'rgba(245, 158, 11, 0.2)',
        iconColor: '#f59e0b',
        gradient: 'agent-card-gradient-3',
        title: 'Meeting Notes & Action Items',
        description: 'Join your virtual meetings, transcribe conversations in real-time, and extract action items, decisions, and follow-ups. Never miss a meeting takeaway again.',
        features: ['Live Transcribe', 'Action Items', 'Decision Log', 'Auto Share'],
        badge: 'Enterprise',
        badgeColor: '#f59e0b',
    },
    {
        icon: BrainCircuit,
        iconBg: 'rgba(168, 85, 247, 0.1)',
        iconBorder: 'rgba(168, 85, 247, 0.2)',
        iconColor: '#a855f7',
        gradient: 'agent-card-gradient-5',
        title: 'Social Media Manager',
        description: 'Drafts, schedules, and publishes content across Instagram, Twitter, LinkedIn, and more. Analyzes engagement metrics and suggests optimal posting times.',
        features: ['Multi-Platform', 'Auto Schedule', 'Analytics', 'Content Ideas'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: Shield,
        iconBg: 'rgba(239, 68, 68, 0.1)',
        iconBorder: 'rgba(239, 68, 68, 0.2)',
        iconColor: '#ef4444',
        gradient: 'agent-card-gradient-4',
        title: 'Expense & Tax Organizer',
        description: 'Scans receipts, categorizes expenses, tracks GST/ITR-eligible deductions, and generates tax-ready reports. Your personal accountant on autopilot.',
        features: ['Receipt Scan', 'Auto Categorize', 'GST Ready', 'Tax Reports'],
        badge: null,
        badgeColor: null,
    },
    {
        icon: Bot,
        iconBg: 'rgba(236, 72, 153, 0.1)',
        iconBorder: 'rgba(236, 72, 153, 0.2)',
        iconColor: '#ec4899',
        gradient: 'agent-card-gradient-6',
        title: 'Customer Support Agent',
        description: 'Plug into your Telegram, WhatsApp, or website chat. Handles FAQs, order tracking, refunds, and escalations — trained on your business knowledge base.',
        features: ['Multi-Channel', 'FAQ Training', 'Escalation', '24/7 Live'],
        badge: 'Business',
        badgeColor: '#ec4899',
    },
];

const SkilledAgents = ({ setCurrentPage }) => {
    return (
        <div className="skilled-page">
            {/* Hero */}
            <section className="skilled-hero">
                <div className="skilled-hero-inner">
                    <div className="skilled-hero-badge">
                        <Sparkles size={14} /> Coming Soon — Early Access Q2 2026
                    </div>
                    <h1>AI Agents That Actually Do Things For You</h1>
                    <p>
                        Not just chatbots. Dedicated, skilled AI agents that live on your phone and autonomously handle real tasks — reminders, summaries, presentations, health tracking, and more.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="cta-primary-btn" onClick={() => setCurrentPage('dashboard')}>
                            <Rocket size={20} /> Deploy Your First Agent
                        </button>
                        <button className="cta-secondary-btn" onClick={() => document.getElementById('agents-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                            Browse Agent Catalog <ArrowRight size={18} />
                        </button>
                    </div>

                    <div className="skilled-hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">12+</div>
                            <div className="hero-stat-label">Skilled Agents</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">500+</div>
                            <div className="hero-stat-label">AI Models Available</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">30s</div>
                            <div className="hero-stat-label">Deploy Time</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">24/7</div>
                            <div className="hero-stat-label">Always Online</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agent Catalog */}
            <section className="agents-section" id="agents-catalog">
                <div className="agents-section-header">
                    <h2>Pre-Built Agent Catalog</h2>
                    <p>Each agent runs on its own dedicated cloud VM with end-to-end encryption. Deploy in 30 seconds, accessible via Telegram.</p>
                </div>

                <div className="agents-grid">
                    {AGENTS.map((agent, i) => (
                        <div key={i} className={`agent-showcase-card ${agent.gradient}`}>
                            {agent.badge && (
                                <div className="agent-card-badge" style={{ background: `${agent.badgeColor}20`, color: agent.badgeColor, border: `1px solid ${agent.badgeColor}40` }}>
                                    {agent.badge}
                                </div>
                            )}
                            <div className="agent-card-icon" style={{ background: agent.iconBg, border: `1px solid ${agent.iconBorder}` }}>
                                <agent.icon size={24} color={agent.iconColor} />
                            </div>
                            <div className="agent-card-content">
                                <h3>{agent.title}</h3>
                                <p>{agent.description}</p>
                                <div className="agent-card-features">
                                    {agent.features.map((f, j) => (
                                        <span key={j} className="agent-feature-tag">{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="how-section-inner">
                    <h2>How It Works</h2>
                    <div className="how-steps">
                        <div className="how-step">
                            <div className="how-step-num">1</div>
                            <div className="how-step-content">
                                <h4>Choose Your Agent</h4>
                                <p>Browse our catalog of pre-built skilled agents. Each is trained for a specific task — from reminders to document processing.</p>
                            </div>
                        </div>
                        <div className="how-step">
                            <div className="hi-text">
                                <h4>Connect Your Telegram</h4>
                                <p>Link your Telegram bot token in one click. Your agent gets its own dedicated identity on Telegram — private and secure.</p>
                            </div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-content">
                                <h4>Deploy in 30 Seconds</h4>
                                <p>We provision a dedicated cloud VM with pre-baked infrastructure. Your agent boots instantly with HTTPS encryption out of the box.</p>
                            </div>
                        </div>
                        <div className="how-step">
                            <div className="how-step-num">4</div>
                            <div className="how-step-content">
                                <h4>It Just Works — 24/7</h4>
                                <p>Your agent runs autonomously, always online. Auto-updates, self-heals, and scales. You focus on your life — your agent handles the rest.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="skilled-cta">
                <div className="skilled-cta-inner">
                    <h2>The Future of Personal AI is Here</h2>
                    <p>
                        Join thousands of early adopters building their personal AI workforce. Each agent is a dedicated, secure, always-on digital employee — no prompting, no babysitting.
                    </p>
                    <div className="skilled-cta-buttons">
                        <button className="cta-primary-btn" onClick={() => setCurrentPage('dashboard')}>
                            <Zap size={20} /> Get Started Free
                        </button>
                        <button className="cta-secondary-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            Back to Top
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SkilledAgents;
