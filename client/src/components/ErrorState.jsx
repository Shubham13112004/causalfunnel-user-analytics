import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertCircle size={22} />
      </div>
      <div className="error-state-title">Something went wrong</div>
      <div className="error-state-msg">{message || 'An unexpected error occurred.'}</div>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} style={{ marginTop: 8 }}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}
