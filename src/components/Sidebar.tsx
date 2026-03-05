import React from 'react';
import { BrainCircuit, LayoutDashboard, Users, Wallet, TrendingUp, Settings, LogOut } from 'lucide-react';
import { NavItem } from './ui/NavItem';

interface SidebarProps {
    currentUser: {
        name: string;
        avatar_url?: string;
        color?: string;
    };
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

export function Sidebar({ currentUser, activeTab, setActiveTab, onLogout }: SidebarProps) {
    return (
        <nav className="sidebar glass-panel">
            <div className="logo">
                <BrainCircuit className="logo-icon" />
                <span>EquiFinance IA</span>
            </div>
            <div className="nav-items">
                <NavItem
                    icon={<LayoutDashboard />}
                    label="Dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <NavItem
                    icon={<Users />}
                    label="Casal"
                    active={activeTab === 'couple'}
                    onClick={() => setActiveTab('couple')}
                />
                <NavItem
                    icon={<Wallet />}
                    label="Transações"
                    active={activeTab === 'transactions'}
                    onClick={() => setActiveTab('transactions')}
                />
                <NavItem
                    icon={<TrendingUp />}
                    label="Simulador"
                    active={activeTab === 'simulator'}
                    onClick={() => setActiveTab('simulator')}
                />
            </div>
            <div className="nav-footer">
                <div className="current-profile" onClick={onLogout}>
                    <div
                        className="avatar mini"
                        style={{ background: currentUser.color || 'var(--accent-primary)' }}
                    >
                        {currentUser.name ? currentUser.name[0].toUpperCase() : '?'}
                    </div>
                    <div className="profile-info">
                        <span>{currentUser.name}</span>
                        <p>Sair <LogOut size={10} style={{ display: 'inline', marginLeft: '4px' }} /></p>
                    </div>
                </div>
                <NavItem icon={<Settings />} label="Configurações" />
            </div>
        </nav>
    );
}
