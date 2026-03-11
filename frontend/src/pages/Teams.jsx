import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Settings } from 'lucide-react';
import './Dashboard.css';

const Teams = () => {
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/teams')
            .then(res => res.json())
            .then(data => {
                setTeamData(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Team Info...</div>;

    return (
        <div className="dashboard-container fade-in">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Team Management</h2>
                    <p>Manage access to your {teamData.teamName}.</p>
                </div>
                <button className="primary-button"><UserPlus size={16} /> Invite Member</button>
            </header>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Agents</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{teamData.activeAgents} / {teamData.maxAgents}</div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '16px' }}>Team Members</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {teamData.members.map(member => (
                            <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.role}</div>
                                    </div>
                                </div>
                                <button className="secondary-button" style={{ padding: '8px', minWidth: 'auto' }}><Settings size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Teams;
