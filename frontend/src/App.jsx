import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import SkilledAgents from './pages/SkilledAgents';
import Partners from './pages/Partners';
import Legal from './pages/Legal';
import Footer from './components/Footer';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, currentUser, setCurrentPage }) {
    useEffect(() => {
        if (currentUser === null) {
            setCurrentPage('landing');
        }
    }, [currentUser, setCurrentPage]);

    if (currentUser === null) return null;
    return children;
}

function App() {
    const [currentPage, setCurrentPage] = React.useState('landing');
    const { currentUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            localStorage.setItem('inshort_ref', ref);
        }
    }, []);

    return (
        <div className="app-container">
            <Navbar setCurrentPage={setCurrentPage} />
            <main style={{ marginTop: '72px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {currentPage === 'landing' && <LandingPage setCurrentPage={setCurrentPage} />}

                {currentPage === 'dashboard' && (
                    <ProtectedRoute currentUser={currentUser} setCurrentPage={setCurrentPage}>
                        <Dashboard />
                    </ProtectedRoute>
                )}

                {currentPage === 'billing' && <Billing />}

                {currentPage === 'agents' && <SkilledAgents setCurrentPage={setCurrentPage} />}

                {currentPage === 'partners' && (
                    <ProtectedRoute currentUser={currentUser} setCurrentPage={setCurrentPage}>
                        <Partners setCurrentPage={setCurrentPage} />
                    </ProtectedRoute>
                )}

                {['about', 'privacy', 'terms', 'refunds', 'shipping', 'contact'].includes(currentPage) && (
                    <Legal page={currentPage} />
                )}
            </main>
            <Footer setCurrentPage={setCurrentPage} />
        </div>
    );
}

export default App;

