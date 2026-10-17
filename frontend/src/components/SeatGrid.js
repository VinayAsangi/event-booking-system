import React, { useState } from 'react';

const ROW_CATEGORIES = {
  A: { label: 'Premium', color: '#ffd700' },
  B: { label: 'Premium', color: '#ffd700' },
  C: { label: 'Standard', color: '#4a9eff' },
  D: { label: 'Economy', color: '#888' },
  E: { label: 'Economy', color: '#888' },
};

const STATUS_STYLES = {
  AVAILABLE: { bg: '#1a1a2e', border: '#4a9eff', label: 'Available', cursor: 'pointer' },
  SELECTED:  { bg: '#4a9eff', border: '#4a9eff', label: 'Selected',  cursor: 'pointer' },
  RESERVED:  { bg: '#2a2a2a', border: '#ff9f43', label: 'Reserved',  cursor: 'not-allowed' },
  BOOKED:    { bg: '#2a2a2a', border: '#ff6b6b', label: 'Booked',    cursor: 'not-allowed' },
};

// ── Tooltip ────────────────────────────────────────────────────────────────
const Tooltip = ({ seat, visible }) => {
  if (!visible) return null;
  const cat = ROW_CATEGORIES[seat.row];
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 8,
      padding: '8px 12px',
      whiteSpace: 'nowrap',
      zIndex: 100,
      pointerEvents: 'none',
      boxShadow: '0 4px 16px #00000088',
      minWidth: 120,
      textAlign: 'center',
    }}>
      <div style={{ fontWeight: 700, color: '#e6edf3', fontSize: 14 }}>{seat.id}</div>
      <div style={{ color: '#4a9eff', fontWeight: 700, fontSize: 13 }}>₹{seat.price.toLocaleString()}</div>
      <div style={{ color: cat.color, fontSize: 11, marginTop: 2 }}>{cat.label}</div>
      <div style={{ color: '#666', fontSize: 11 }}>{seat.status}</div>
      {/* Arrow */}
      <div style={{
        position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
        width: 10, height: 10, background: '#161b22',
        border: '1px solid #30363d', borderTop: 'none', borderLeft: 'none',
        transform: 'translateX(-50%) rotate(45deg)',
      }} />
    </div>
  );
};

// ── Seat Button ─────────────────────────────────────────────────────────────
const SeatButton = ({ seat, isSelected, onClick, isFiltered }) => {
  const [hovered, setHovered] = useState(false);
  const statusKey = isSelected ? 'SELECTED' : seat.status;
  const style = STATUS_STYLES[statusKey] || STATUS_STYLES.AVAILABLE;
  const isClickable = seat.status === 'AVAILABLE' || isSelected;
  const dimmed = isFiltered || (seat.status === 'BOOKED');

  // Reserved seats: animated border pulse via inline keyframes workaround
  const isReserved = seat.status === 'RESERVED';

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => isClickable && onClick(seat.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Seat ${seat.id}, ${seat.status}, ₹${seat.price}`}
        aria-pressed={isSelected}
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          border: `2px solid ${style.border}`,
          backgroundColor: style.bg,
          color: isSelected ? '#fff' : '#ccc',
          fontWeight: 700,
          fontSize: 13,
          cursor: style.cursor,
          transition: 'all 0.15s ease',
          opacity: dimmed ? 0.35 : 1,
          outline: 'none',
          transform: hovered && isClickable ? 'scale(1.08)' : 'scale(1)',
          boxShadow: isSelected
            ? '0 0 12px #4a9eff55'
            : isReserved
            ? '0 0 8px #ff9f4333'
            : 'none',
          animation: isReserved ? 'reservedPulse 2s ease-in-out infinite' : 'none',
        }}
      >
        {seat.id}
      </button>
      <Tooltip seat={seat} visible={hovered} />
    </div>
  );
};

// ── Price Filter ─────────────────────────────────────────────────────────────
const PriceFilter = ({ activeFilter, onFilter }) => {
  const filters = [
    { label: 'All', value: null },
    { label: '⭐ Premium (A–B)', value: 'PREMIUM' },
    { label: '◆ Standard (C)', value: 'STANDARD' },
    { label: '● Economy (D–E)', value: 'ECONOMY' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      {filters.map(f => (
        <button
          key={f.label}
          onClick={() => onFilter(f.value)}
          style={{
            padding: '5px 12px',
            borderRadius: 20,
            border: `1px solid ${activeFilter === f.value ? '#4a9eff' : '#30363d'}`,
            background: activeFilter === f.value ? '#4a9eff22' : 'transparent',
            color: activeFilter === f.value ? '#4a9eff' : '#888',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

// ── Row Category Dividers ────────────────────────────────────────────────────
const CATEGORY_GROUPS = {
  PREMIUM:  ['A', 'B'],
  STANDARD: ['C'],
  ECONOMY:  ['D', 'E'],
};

const CATEGORY_META = {
  PREMIUM:  { label: 'Premium',  color: '#ffd700', desc: '₹1,000 – ₹1,200' },
  STANDARD: { label: 'Standard', color: '#4a9eff', desc: '₹800' },
  ECONOMY:  { label: 'Economy',  color: '#888',    desc: '₹500 – ₹600' },
};

// ── Main Grid ────────────────────────────────────────────────────────────────
const SeatGrid = ({ seats, selectedIds, onToggle }) => {
  const [priceFilter, setPriceFilter] = useState(null);

  const rowMap = {};
  for (const seat of seats) {
    if (!rowMap[seat.row]) rowMap[seat.row] = [];
    rowMap[seat.row].push(seat);
  }

  const isRowFiltered = (row) => {
    if (!priceFilter) return false;
    return !CATEGORY_GROUPS[priceFilter]?.includes(row);
  };

  return (
    <div>
      {/* CSS for reserved pulse animation */}
      <style>{`
        @keyframes reservedPulse {
          0%, 100% { box-shadow: 0 0 4px #ff9f4333; }
          50%       { box-shadow: 0 0 14px #ff9f4377; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>

      {/* Stage */}
      <div style={{
        textAlign: 'center', padding: '10px 0', marginBottom: 20,
        background: 'linear-gradient(90deg, transparent, #4a9eff33, transparent)',
        borderTop: '3px solid #4a9eff',
        letterSpacing: 6, fontSize: 13, color: '#4a9eff', fontWeight: 700,
      }}>
        ★  STAGE  ★
      </div>

      {/* Price filter */}
      <PriceFilter activeFilter={priceFilter} onFilter={setPriceFilter} />

      {/* Seat rows, grouped by category */}
      {Object.entries(CATEGORY_META).map(([catKey, catMeta]) => {
        const rows = CATEGORY_GROUPS[catKey];
        const isFilteredOut = priceFilter && priceFilter !== catKey;
        return (
          <div key={catKey} style={{ marginBottom: 18, opacity: isFilteredOut ? 0.25 : 1, transition: 'opacity 0.2s' }}>
            {/* Category header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
            }}>
              <div style={{ height: 1, flex: 1, background: '#21262d' }} />
              <span style={{ color: catMeta.color, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                {catMeta.label.toUpperCase()}
              </span>
              <span style={{ color: '#444', fontSize: 11 }}>{catMeta.desc}</span>
              <div style={{ height: 1, flex: 1, background: '#21262d' }} />
            </div>

            {rows.map(row => (
              <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 20, color: '#666', fontWeight: 700, fontSize: 13 }}>{row}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(rowMap[row] || []).sort((a, b) => a.col - b.col).map(seat => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedIds.includes(seat.id)}
                      isFiltered={false}
                      onClick={onToggle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_STYLES).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3,
              background: val.bg, border: `2px solid ${val.border}`,
            }} />
            <span style={{ fontSize: 12, color: '#888' }}>{val.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
