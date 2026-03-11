import React from 'react';
import './Footer.css';

const Footer = ({ setCurrentPage }) => {
    return (
        <footer className="site-footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    <h3>OpenClaw SaaS</h3>
                    <p>Automate your life and business with dedicated AI agents. Delivered instantly to the cloud.</p>
                </div>

                <div className="footer-links">
                    <div className="link-column">
                        <h4>Platform</h4>
                        <button onClick={() => setCurrentPage('landing')}>Home</button>
                        <button onClick={() => setCurrentPage('agents')}>Agent Catalog</button>
                        <button onClick={() => setCurrentPage('billing')}>Pricing</button>
                    </div>

                    <div className="link-column">
                        <h4>Company</h4>
                        <button onClick={() => setCurrentPage('about')}>About Us</button>
                        <button onClick={() => setCurrentPage('contact')}>Contact Us</button>
                    </div>

                    <div className="link-column">
                        <h4>Legal</h4>
                        <button onClick={() => setCurrentPage('privacy')}>Privacy Policy</button>
                        <button onClick={() => setCurrentPage('terms')}>Terms of Service</button>
                        <button onClick={() => setCurrentPage('refunds')}>Refund Policy</button>
                        <button onClick={() => setCurrentPage('shipping')}>Shipping & Delivery</button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} OpenClaw SaaS (Inshort Live). All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
