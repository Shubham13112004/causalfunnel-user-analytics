import React from 'react';
import { formatNumber } from '../utils/formatters';

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-label">{label}</div>
        {Icon && (
          <div
            className="stat-card-icon"
            style={{ background: iconBg || '#eef2ff', color: iconColor || '#4f46e5' }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="stat-card-value">
        {value === null || value === undefined ? (
          <span className="skeleton" style={{ display: 'block', height: 28, width: 80 }} />
        ) : (
          formatNumber(value)
        )}
      </div>
      {subtitle && <div className="stat-card-sub">{subtitle}</div>}
    </div>
  );
}
