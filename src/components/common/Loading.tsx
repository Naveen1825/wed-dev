import React from 'react';

/**
 * Global application-wide loading state for page transitions and data fetching.
 * Features a high-quality centered spinner animation with AniSell branding.
 */
export const Loading: React.FC<{ fullScreen?: boolean; message?: string }> = ({ fullScreen = true, message = "Synchronizing Registry..." }) => {
  const containerStyle: React.CSSProperties = fullScreen 
    ? { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999 }
    : { padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };

  return (
    <div className="discovery-loading" style={containerStyle}>
      <div className="ring-container">
        <div className="pulsar"></div>
        <div className="orbit"></div>
      </div>
      <p style={{ marginTop: '24px', fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{message}</p>
      <style>{`
        .ring-container { position: relative; width: 60px; height: 60px; display: flex; align-items: center; justifyContent: center; }
        .pulsar { width: 30px; height: 30px; background: #2563eb; border-radius: 50%; animation: pulse 1.5s ease-out infinite; }
        .orbit { position: absolute; width: 60px; height: 60px; border: 4px solid #3b82f6; border-top-color: transparent; border-bottom-color: transparent; border-radius: 50%; animation: dual-orbit 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; }
        
        @keyframes pulse { 0% { transform: scale(0.6); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes dual-orbit { 0% { transform: rotate(0deg); border-width: 4px; } 50% { transform: rotate(180deg); border-width: 1px; } 100% { transform: rotate(360deg); border-width: 4px; } }
      `}</style>
    </div>
  );
};
