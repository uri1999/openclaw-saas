import React from 'react';
import './Legal.css';

const Legal = ({ page }) => {
    
    const getContent = () => {
        switch (page) {
            case 'about':
                return (
                    <>
                        <h1>About Us</h1>
                        <p>Welcome to Inshort Agents (operated by Inshort Live). We are a technology company dedicated to democratizing access to autonomous AI agents.</p>
                        <p>Our mission is to help founders, developers, and professionals automate their workflows by providing instant, secure, and scalable cloud infrastructure for AI agents. We handle the complex DevOps—provisioning Google Cloud VMs, configuring Docker, setting up reverse proxies, and securing networks—so that our users can focus entirely on building and deploying their agentic workflows.</p>
                        <p>Our platform strictly deals in digital software as a service (SaaS) and cloud computing resources.</p>
                        <h3>Business Category</h3>
                        <p><strong>Software & Cloud Infrastructure (SaaS) / IT Services</strong></p>
                        <p>We provide digital web services, remote cloud environments, and software integration tools.</p>
                    </>
                );
            case 'privacy':
                return (
                    <>
                        <h1>Privacy Policy</h1>
                        <p>Last updated: March 2026</p>
                        <p>Inshort Agents ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal data when you use our website and services.</p>
                        <h3>1. Information We Collect</h3>
                        <p>We only collect the information necessary to provide our services. This includes:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, and profile picture provided via Google Authentication.</li>
                            <li><strong>Billing Information:</strong> We do not store credit card details on our servers. All payments are securely processed by our payment gateway (Razorpay).</li>
                            <li><strong>Usage Data:</strong> Server metrics, agent deployment status, and basic telemetry to monitor the health of your VM infrastructure.</li>
                        </ul>
                        <h3>2. How We Use Your Information</h3>
                        <p>We use your information exclusively to provide and improve our services, manage your cloud instances, process payments, and send important service-related notifications.</p>
                        <h3>3. Data Security</h3>
                        <p>Your agent data runs on dedicated, isolated virtual machines with HTTPS encryption enforced by default. We do not access, sell, or share your data with third-party advertisers.</p>
                    </>
                );
            case 'terms':
                return (
                    <>
                        <h1>Terms of Service</h1>
                        <p>By accessing or using Inshort Agents, you agree to comply with these terms.</p>
                        <h3>1. Provision of Service</h3>
                        <p>We provide hosted virtual machines and software environments. We are not responsible for the content, code, or actions executed by the AI agents you deploy on our infrastructure.</p>
                        <h3>2. Acceptable Use</h3>
                        <p>You agree not to use our infrastructure for malicious activities, including but not limited to DDoS attacks, spamming, hosting malware, or violating any local or international laws. We reserve the right to instantly terminate instances violating this policy without a refund.</p>
                        <h3>3. Uptime & Availability</h3>
                        <p>While we strive for 99.9% uptime, we do not guarantee uninterrupted access. We are not liable for any data loss or operational damages caused by unexpected downtime or server failures.</p>
                    </>
                );
            case 'refunds':
                return (
                    <>
                        <h1>Refund & Cancellation Policy</h1>
                        <p>Due to the nature of our business providing instant digital goods and cloud computing resources, our refund policy is strict but fair.</p>
                        <h3>Digital Goods Notice & Business Category</h3>
                        <p><strong>Business Category: Software & Cloud Infrastructure / IT Services (SaaS)</strong></p>
                        <p>We provide <strong>Software as a Service (SaaS)</strong> and <strong>Cloud Computing Resources</strong>. Upon successful payment, a dedicated Google Cloud Virtual Machine is instantly provisioned on your behalf. Because these are digital compute resources that incur immediate costs to us, all sales are generally considered final.</p>
                        <h3>Cancellations</h3>
                        <p>You can cancel your subscription at any time from your billing dashboard. When you cancel, your VMs and agents will remain active until the end of your current billing cycle, after which they will be permanently destroyed. We do not automatically charge you after cancellation.</p>
                        <h3>Refund Eligibility</h3>
                        <p>Refunds are only granted in the following scenarios:</p>
                        <ul>
                            <li>If a technical failure on our end prevents your agent from deploying successfully within the first 48 hours of purchase.</li>
                            <li>If you made an accidental duplicate purchase (must be reported within 24 hours).</li>
                        </ul>
                        <p>To request a refund, please email our support team with your transaction ID and the reason for the request. Approved refunds will be processed and credited back to the original payment method within 5-7 business days.</p>
                    </>
                );
            case 'shipping':
                return (
                    <>
                        <h1>Shipping & Delivery Policy</h1>
                        <p><strong>Inshort Agents provides exclusively digital services and cloud software. As such, no physical goods are shipped.</strong></p>
                        <h3>Delivery Timeline</h3>
                        <p>Delivery of our service happens instantaneously online.</p>
                        <ul>
                            <li>Upon successful payment confirmation, our backend API immediately triggers the creation of your dedicated virtual machine.</li>
                            <li>Your Inshort Agent gateway and n8n workspaces are typically fully booted and accessible within <strong>30 to 60 seconds</strong> of purchase.</li>
                            <li>You will immediately see your active instance on your Dashboard, along with its unique IP address and secure HTTPS URL.</li>
                        </ul>
                        <p>There are no tracking numbers, shipping fees, or delivery delays. If your instance does not appear on your dashboard within 5 minutes of payment, please contact support immediately.</p>
                    </>
                );
            case 'contact':
                return (
                    <>
                        <h1>Contact Us</h1>
                        <p>If you have any questions, technical issues, or billing inquiries, we are here to help!</p>
                        <div className="contact-details">
                            <p><strong>Email:</strong> admin@inshort.live</p>
                            <p><strong>Operating Entity:</strong> Inshort Live</p>
                            <br />
                            <p>Our support team generally responds within 24 hours on business days.</p>
                        </div>
                    </>
                );
            default:
                return <h1>Page Not Found</h1>;
        }
    };

    return (
        <div className="legal-page">
            <div className="container legal-container fade-in">
                {getContent()}
            </div>
        </div>
    );
};

export default Legal;
