import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (message, opts) => addToast({ message, type: 'success', ...opts }),
    error:   (message, opts) => addToast({ message, type: 'error',   ...opts }),
    warn:    (message, opts) => addToast({ message, type: 'warn',    ...opts }),
    info:    (message, opts) => addToast({ message, type: 'info',    ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// ── Styles ──────────────────────────────────────────────────────────────────

const TYPE_STYLES = {
  success: { border: '#238636', bg: '#23863622', color: '#3fb950', icon: '✓' },
  error:   { border: '#da3633', bg: '#da363322', color: '#ff7b72', icon: '✕' },
  warn:    { border: '#ff9f43', bg: '#ff9f4322', color: '#ffc47a', icon: '⚠' },
  info:    { border: '#4a9eff', bg: '#4a9eff22', color: '#79c0ff', icon: 'ℹ' },
};

const ToastContainer = ({ toasts, onDismiss }) => (
  <div style={{
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 360,
    pointerEvents: 'none',
  }}>
    {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
  </div>
);

const Toast = ({ toast, onDismiss }) => {
  const s = TYPE_STYLES[toast.type] || TYPE_STYLES.info;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 10,
      background: '#0d1117',
      border: `1px solid ${s.border}`,
      boxShadow: `0 4px 20px #00000066`,
      animation: 'slideIn 0.2s ease',
      pointerEvents: 'all',
    }}>
      <span style={{ color: s.color, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
        {s.icon}
      </span>
      <span style={{ color: '#e6edf3', fontSize: 13, flex: 1, lineHeight: 1.5 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none', border: 'none', color: '#666',
          cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};
