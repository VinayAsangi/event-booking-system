import React from 'react';

const STEPS = [
  { key: 'select',  label: 'Select Seats', icon: '🪑' },
  { key: 'reserve', label: 'Reserve',      icon: '🔒' },
  { key: 'pay',     label: 'Payment',      icon: '💳' },
  { key: 'done',    label: 'Confirmed',    icon: '✅' },
];

const StepIndicator = ({ currentStep }) => {
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '14px 24px',
      gap: 0,
    }}>
      {STEPS.map((step, idx) => {
        const isDone    = idx < currentIdx;
        const isActive  = idx === currentIdx;
        const isFuture  = idx > currentIdx;

        return (
          <React.Fragment key={step.key}>
            {/* Step circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isDone ? 14 : 16,
                background: isDone
                  ? '#238636'
                  : isActive
                  ? '#4a9eff22'
                  : '#161b22',
                border: `2px solid ${isDone ? '#238636' : isActive ? '#4a9eff' : '#30363d'}`,
                transition: 'all 0.3s',
              }}>
                {isDone ? '✓' : step.icon}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 400,
                color: isDone ? '#3fb950' : isActive ? '#4a9eff' : '#555',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                height: 2,
                width: 48,
                marginBottom: 18,
                background: idx < currentIdx ? '#238636' : '#21262d',
                transition: 'background 0.3s',
                flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
