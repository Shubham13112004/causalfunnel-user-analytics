import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MousePointerClick,
  Activity,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/sessions', label: 'Sessions', icon: Users },
  { to: '/heatmap', label: 'Heatmap', icon: MousePointerClick },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Activity size={18} />
        </div>
        <div>
          <div className="sidebar-logo-text">CausalFunnel</div>
          <div className="sidebar-logo-sub">Analytics Dashboard</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main</div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 4, fontWeight: 600, color: '#64748b' }}>
          Demo Page
        </div>
        <a
          href="http://localhost:5500/demo/index.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#4f46e5',
            fontSize: '.72rem',
            textDecoration: 'none',
          }}
        >
          Open Demo <ExternalLink size={11} />
        </a>
      </div>
    </aside>
  );
}
