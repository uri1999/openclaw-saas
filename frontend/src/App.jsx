import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import SkilledAgents from './pages/SkilledAgents';
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
            </main>
        </div>
    );
}

export default App;

