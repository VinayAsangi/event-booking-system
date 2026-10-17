import React from 'react';

const MAX_SEATS = 5;

const BookingSummary = ({ seats, selectedIds, onReserve, onClear, loading }) => {
  const selectedSeats = seats.filter(s => selectedIds.includes(s.id));
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const canReserve = selectedIds.length > 0 && selectedIds.length <= MAX_SEATS;
  const count = selectedIds.length;

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: 12,
      padding: 20,
      minWidth: 240,
    }}>
      {/* Header with seat count badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: '#e6edf3', fontSize: 15, fontWeight: 700 }}>
          Booking Summary
        </h3>
        <div style={{
          background: count > 0 ? '#4a9eff22' : '#21262d',
          border: `1px solid ${count > 0 ? '#4a9eff' : '#30363d'}`,
          borderRadius: 20,
          padding: '2px 10px',
          fontSize: 12,
          fontWeight: 700,
          color: count > 0 ? '#4a9eff' : '#555',
          transition: 'all 0.2s',
        }}>
          {count} / {MAX_SEATS}
        </div>
      </div>

      {count === 0 ? (
        <p style={{ color: '#555', fontSize: 13, margin: '0 0 16px' }}>
          Select seats from the grid to get started.
        </p>
      ) : (
        <>
          {/* Selected seat chips */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 6, letterSpacing: 0.5 }}>
              SELECTED SEATS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedSeats.map(s => (
                <div key={s.id} style={{
                  background: '#4a9eff22',
                  border: '1px solid #4a9eff44',
                  borderRadius: 6,
                  padding: '3px 8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, color: '#4a9eff', fontWeight: 700 }}>{s.id}</div>
                  <div style={{ fontSize: 10, color: '#666' }}>₹{s.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{ borderTop: '1px solid #21262d', paddingTop: 12, marginBottom: 12 }}>
            {selectedSeats.map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 4, fontSize: 12,
              }}>
                <span style={{ color: '#666' }}>Seat {s.id}</span>
                <span style={{ color: '#888' }}>₹{s.price.toLocaleString()}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              borderTop: '1px solid #21262d', paddingTop: 8, marginTop: 4,
            }}>
              <span style={{ color: '#888', fontSize: 13 }}>Total</span>
              <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: 18 }}>
                ₹{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Max seats warning */}
          {count >= MAX_SEATS && (
            <div style={{
              background: '#ff9f4311', border: '1px solid #ff9f4344',
              borderRadius: 6, padding: '6px 10px',
              color: '#ffc47a', fontSize: 12, marginBottom: 10,
            }}>
              Maximum {MAX_SEATS} seats reached.
            </div>
          )}
        </>
      )}

      {/* Reserve button */}
      <button
        onClick={onReserve}
        disabled={!canReserve || loading}
        style={{
          width: '100%',
          padding: '11px 0',
          borderRadius: 8,
          border: 'none',
          background: canReserve && !loading ? '#4a9eff' : '#21262d',
          color: canReserve && !loading ? '#fff' : '#555',
          fontWeight: 700,
          fontSize: 14,
          cursor: canReserve && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          marginBottom: count > 0 ? 8 : 0,
        }}
      >
        {loading ? 'Reserving…' : `Reserve ${count > 0 ? count : ''} Seat${count !== 1 ? 's' : ''}`}
      </button>

      {/* Clear selection button */}
      {count > 0 && (
        <button
          onClick={onClear}
          style={{
            width: '100%',
            padding: '8px 0',
            borderRadius: 8,
            border: '1px solid #30363d',
            background: 'transparent',
            color: '#888',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color = '#e6edf3'; e.target.style.borderColor = '#555'; }}
          onMouseLeave={e => { e.target.style.color = '#888';    e.target.style.borderColor = '#30363d'; }}
        >
          Clear Selection
        </button>
      )}
    </div>
  );
};

export default BookingSummary;
