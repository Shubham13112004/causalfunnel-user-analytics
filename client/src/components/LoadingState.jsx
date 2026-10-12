import React from 'react';

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>{message}</div>
    </div>
  );
}
