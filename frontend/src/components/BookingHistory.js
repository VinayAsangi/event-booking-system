import React, { useState } from 'react';

const BookingHistory = ({ history, onClear }) => {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 16,
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>📋</span>
          <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: 14 }}>My Bookings</span>
          <span style={{
            background: '#238636', borderRadius: 20,
            padding: '1px 8px', fontSize: 11, color: '#fff', fontWeight: 700,
          }}>
            {history.length}
          </span>
        </div>
        <span style={{ color: '#666', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #21262d', padding: '12px 16px' }}>
          {history.map(entry => (
            <div key={entry.id} style={{
              padding: '10px 0',
              borderBottom: '1px solid #161b22',
            }}>
              {/* Booking row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {entry.seats.map(s => (
                    <span key={s.id} style={{
                      background: '#23863622', border: '1px solid #23863655',
                      borderRadius: 4, padding: '1px 6px',
                      fontSize: 11, color: '#3fb950', fontWeight: 700,
                    }}>
                      {s.id}
                    </span>
                  ))}
                </div>
                <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: 13 }}>
                  ₹{entry.total.toLocaleString()}
                </span>
              </div>
              <div style={{ color: '#555', fontSize: 11 }}>
                {new Date(entry.bookedAt).toLocaleString()}
              </div>
            </div>
          ))}

          <button
            onClick={onClear}
            style={{
              marginTop: 10,
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 12,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Clear history
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
