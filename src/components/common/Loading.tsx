import React from 'react';

/**
 * Global application-wide loading state for page transitions and data fetching.
 * Features a high-quality centered spinner animation with AniSell branding.
 */
export const Loading: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = true }) => {
  const containerStyle: React.CSSProperties = fullScreen 
    ? { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', zIndex: 9999 }
    : { padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  return (
    <div className="loading-container" style={containerStyle}>
      <div className="spinner"></div>
      <style>{`
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2874f0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
