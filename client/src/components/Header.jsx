import React, { useEffect, useState } from 'react';
import { getHealth } from '../services/api';

export default function Header({ title }) {
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    getHealth()
      .then((data) => setDbStatus(data.database?.status))
      .catch(() => setDbStatus('offline'));

    const interval = setInterval(() => {
      getHealth()
        .then((data) => setDbStatus(data.database?.status))
        .catch(() => setDbStatus('offline'));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isLive = dbStatus === 'connected';

  return (
    <header className="header">
      <div className="header-page-title">{title}</div>
      <div className={`header-badge ${isLive ? 'live' : dbStatus === null ? 'live' : 'offline'}`}>
        <span className={`status-dot ${isLive ? 'pulse' : ''}`} />
        {dbStatus === null ? 'Checking…' : isLive ? 'DB Connected' : 'DB Offline'}
      </div>
    </header>
  );
}
