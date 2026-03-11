import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Sparkles, Zap, Crown, ArrowRight, Bot, Shield, Server, Headphones, Loader2, CheckCircle2 } from 'lucide-react';
import './Billing.css';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://openclaw-saas-backend-774090439292.us-central1.run.app';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 49,
        period: '/month',
        tagline: 'For individuals getting started',
        icon: Zap,
        iconColor: '#3b82f6',
        highlight: false,
        features: [
            { text: '1 Dedicated OpenClaw VM', included: true, bold: true },
            { text: 'Single Shared Instance', included: true },
            { text: 'Telegram Integration', included: true },
            { text: 'Standard SLA', included: true },
            { text: '500 AI requests/month', included: true },
            { text: '5 Models (Gemini, GPT-4o-mini)', included: true },
            { text: 'Basic n8n Workflows', included: true },
            { text: 'Community Support', included: true },
            { text: 'Priority Support', included: false },
            { text: 'Custom Agent Training', included: false },
            { text: 'WhatsApp Integration', included: false },
        ],
        agentSlots: 1,
        agentTemplates: ['OpenClaw Agent', 'n8n Pre-configured', 'SSL Automatic'],
        cta: 'Get Started',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 79,
        period: '/month',
        tagline: 'For power users & small teams',
        icon: Sparkles,
        iconColor: '#a855f7',
        highlight: true,
        badge: 'Most Popular',
        features: [
            { text: '2 Dedicated OpenClaw VMs', included: true, bold: true },
            { text: '3 Bundled n8n Workspaces', included: true, bold: true },
            { text: 'Telegram + WhatsApp Integration', included: true },
            { text: 'Dedicated High-Perf VM (e2-standard-4)', included: true },
            { text: '5,000 AI requests/month', included: true },
            { text: '50+ Models (Gemini, GPT-4o, Claude)', included: true },
            { text: 'Advanced n8n Workflows', included: true },
            { text: 'Priority Email Support', included: true },
            { text: 'Custom Sandbox Access', included: true },
            { text: '1-Click Upgrades', included: true },
            { text: 'White-label (Your Brand)', included: false },
        ],
        agentSlots: 2,
        agentTemplates: ['OpenClaw Scaled', 'n8n Advanced', 'Priority Network'],
        cta: 'Deploy Pro Fleet',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        period: '/month',
        tagline: 'For businesses & agencies',
        icon: Crown,
        iconColor: '#f59e0b',
        highlight: false,
        features: [
            { text: '3 Dedicated OpenClaw VMs', included: true, bold: true },
            { text: '3 Bundled n8n Workspaces', included: true, bold: true },
            { text: 'All Integrations (TG, WA, Slack, Web)', included: true },
            { text: 'Dedicated High-Perf VM (e2-standard-4)', included: true },
            { text: 'Unlimited AI requests', included: true },
            { text: '500+ Models (All Providers)', included: true },
            { text: 'Unlimited n8n Workflows', included: true },
            { text: '24/7 Dedicated Support', included: true },
            { text: 'Dedicated Architecture Consultant', included: true },
            { text: 'Team Management (10 seats)', included: true },
            { text: 'White-label (Your Brand)', included: true },
        ],
        agentSlots: 3,
        agentTemplates: ['Custom Architecture', 'White-label Ready'],
        cta: 'Contact Sales',
    },
];

// Script loaded statically in index.html

const Billing = () => {
    const { currentUser } = useAuth();
    const [annual, setAnnual] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [toast, setToast] = useState(null);

    // Fetch current subscription status
    useEffect(() => {
        if (!currentUser) return;
        fetch(`${API_BASE}/api/payment/status/${currentUser.uid}`)
            .then(r => r.json())
            .then(data => {
                if (data.subscribed) setSubscription(data);
            })
            .catch(() => {});
    }, [currentUser]);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    }, []);

    const handleSubscribe = async (planId) => {
        if (!currentUser) {
            showToast('error', 'Please sign in to subscribe');
            return;
        }

        setLoadingPlan(planId);

        try {
            // 1. Check if Razorpay script is loaded
            if (!window.Razorpay) {
                showToast('error', 'Payment service blocked. Please disable your ad-blocker and refresh the page.');
                setLoadingPlan(null);
                return;
            }

            // 2. Create order on backend
            const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    uid: currentUser.uid,
                    email: currentUser.email,
                    annual,
                }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

            // 3. Open Razorpay checkout — optimized for North America
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'OpenClaw SaaS',
                description: `${orderData.planName} Plan — ${annual ? 'Annual' : 'Monthly'}`,
                order_id: orderData.orderId,
                prefill: {
                    email: currentUser.email,
                    name: currentUser.displayName || '',
                },
                theme: {
                    color: '#a855f7',
                    backdrop_color: 'rgba(0, 0, 0, 0.7)',
                },
                // Smart payment options for North America
                config: {
                    display: {
                        blocks: {
                            banks: { name: 'Pay via Card', instruments: [{ method: 'card' }] },
                        },
                        sequence: ['block.banks'],
                        preferences: { show_default_blocks: false },
                    },
                },
                modal: {
                    confirm_close: true,
                    ondismiss: () => setLoadingPlan(null),
                },
                handler: async (response) => {
                    // 4. Verify payment on backend
                    try {
                        const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId,
                                uid: currentUser.uid,
                                annual,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            showToast('success', `🎉 ${orderData.planName} plan activated!`);
                            setSubscription({ subscribed: true, planId, planName: orderData.planName });
                        } else {
                            showToast('error', verifyData.error || 'Payment verification failed');
                        }
                    } catch {
                        showToast('error', 'Could not verify payment. Contact support.');
                    }
                    setLoadingPlan(null);
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                showToast('error', response.error?.description || 'Payment failed. Please try again.');
                setLoadingPlan(null);
            });
            rzp.open();
        } catch (err) {
            console.error('Payment error:', err);
            showToast('error', err.message || 'Something went wrong. Please try again.');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="billing-page">
            {/* Toast */}
            {toast && (
                <div className={`billing-toast billing-toast-${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Hero */}
            <section className="billing-hero">
                <div className="billing-hero-inner">
                    <h1>Plans That Scale With Your Agents</h1>
                    <p>Deploy AI agents that work 24/7. Each plan includes dedicated cloud infrastructure, pre-built skilled agents, and access to the world's best AI models.</p>

                    <div className="billing-toggle">
                        <span className={!annual ? 'toggle-active' : ''}>Monthly</span>
                        <button className="toggle-switch" onClick={() => setAnnual(!annual)} aria-label="Toggle billing period">
                            <div className={`toggle-knob ${annual ? 'annual' : ''}`}></div>
                        </button>
                        <span className={annual ? 'toggle-active' : ''}>Annual <span className="save-badge">Save 20%</span></span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pricing-section">
                <div className="pricing-grid">
                    {PLANS.map((plan) => {
                        const displayPrice = annual ? Math.round(plan.price * 0.8) : plan.price;
                        const isCurrentPlan = subscription?.subscribed && subscription.planId === plan.id;
                        const isLoading = loadingPlan === plan.id;

                        return (
                            <div key={plan.id} className={`pricing-card ${plan.highlight ? 'pricing-card-highlight' : ''}`}>
                                {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
                                {isCurrentPlan && <div className="current-plan-badge">Current Plan</div>}

                                <div className="pricing-card-header">
                                    <div className="pricing-icon" style={{ background: `${plan.iconColor}15`, border: `1px solid ${plan.iconColor}30` }}>
                                        <plan.icon size={22} color={plan.iconColor} />
                                    </div>
                                    <h3>{plan.name}</h3>
                                    <p className="pricing-tagline">{plan.tagline}</p>
                                </div>

                                <div className="pricing-price">
                                    <span className="price-currency">$</span>
                                    <span className="price-amount">{displayPrice}</span>
                                    <span className="price-period">{plan.period}</span>
                                </div>

                                {/* Agent Slots Highlight */}
                                <div className="agent-slots-box" style={{ borderColor: `${plan.iconColor}30` }}>
                                    <div className="agent-slots-count" style={{ color: plan.iconColor }}>{plan.agentSlots}</div>
                                    <div className="agent-slots-label">
                                        <strong>{typeof plan.agentSlots === 'number' && plan.agentSlots === 1 ? 'VM' : 'VMs'}</strong>
                                        <span>Included</span>
                                    </div>
                                </div>

                                <button
                                    className={`pricing-cta ${plan.highlight ? 'pricing-cta-primary' : 'pricing-cta-secondary'} ${isCurrentPlan ? 'pricing-cta-current' : ''}`}
                                    onClick={() => !isCurrentPlan && !isLoading && handleSubscribe(plan.id)}
                                    disabled={isCurrentPlan || isLoading}
                                >
                                    {isLoading ? (
                                        <><Loader2 size={16} className="spin" /> Processing...</>
                                    ) : isCurrentPlan ? (
                                        <><CheckCircle2 size={16} /> Active</>
                                    ) : (
                                        <>{plan.cta} <ArrowRight size={16} /></>
                                    )}
                                </button>

                                <div className="pricing-features">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className={`pricing-feature ${f.included ? '' : 'pricing-feature-disabled'}`}>
                                            {f.included ? <Check size={16} className="feature-check" /> : <X size={16} className="feature-x" />}
                                            <span style={f.bold ? { fontWeight: 600, color: '#fff' } : {}}>{f.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Agent Breakdown */}
            <section className="agent-breakdown">
                <div className="agent-breakdown-inner">
                    <h2>What's Included in Each Deployment</h2>
                    <p className="agent-breakdown-sub">Every VM comes perfectly configured with dedicated resources — no sharing, no throttling.</p>

                    <div className="breakdown-grid">
                        <div className="breakdown-item">
                            <Server size={20} color="var(--accent-color)" />
                            <h4>Dedicated VM</h4>
                            <p>Each agent runs on its own isolated Google Cloud VM with HTTPS encryption.</p>
                        </div>
                        <div className="breakdown-item">
                            <Bot size={20} color="#a855f7" />
                            <h4>OpenClaw Gateway</h4>
                            <p>The core engine allowing your agent to interact with files, bash, and external networks securely.</p>
                        </div>
                        <div className="breakdown-item">
                            <Shield size={20} color="#10b981" />
                            <h4>n8n Workflow Engine</h4>
                            <p>Visual automation builder included — connect APIs, schedule tasks, build custom pipelines directly hooked to OpenClaw.</p>
                        </div>
                        <div className="breakdown-item">
                            <Headphones size={20} color="#f59e0b" />
                            <h4>Telegram / WhatsApp</h4>
                            <p>Talk to your agent directly on Telegram or WhatsApp. It's always online, always ready.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Payment Methods */}
            <section className="payment-methods">
                <div className="payment-methods-inner">
                    <p className="payment-methods-label">Secure payments powered by</p>
                    <div className="payment-logos">
                        <span className="payment-logo">💳 Visa</span>
                        <span className="payment-logo">💳 Mastercard</span>
                        <span className="payment-logo">💳 Amex</span>
                        <span className="payment-logo-razorpay">Razorpay</span>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="billing-faq">
                <div className="billing-faq-inner">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>Can I change my plan later?</h4>
                            <p>Yes. You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What happens when I hit the request limit?</h4>
                            <p>Your agents will continue to work but responses may be slower. You can buy additional request packs anytime.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Which AI models are available?</h4>
                            <p>Starter includes Gemini Flash. Pro adds GPT-4o and Claude. Enterprise unlocks 500+ models via OpenRouter.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Is my data private?</h4>
                            <p>Yes. Each agent runs on an isolated VM. Your data never leaves your instance. We don't train on your data.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Billing;
