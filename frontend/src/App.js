import React, { useState, useCallback } from 'react';
import { useSeats } from './hooks/useSeats';
import { useBookingHistory } from './hooks/useBookingHistory';
import { useToast } from './context/ToastContext';
import SeatGrid from './components/SeatGrid';
import BookingSummary from './components/BookingSummary';
import BookingHistory from './components/BookingHistory';
import StepIndicator from './components/StepIndicator';
import PaymentScreen from './pages/PaymentScreen';
import { reserveSeats } from './services/api';

const MAX_SEATS = 5;

const App = () => {
  const { seats, loading, error, refresh } = useSeats();
  const { history, addBooking, clearHistory } = useBookingHistory();
  const toast = useToast();

  const [selectedIds, setSelectedIds] = useState([]);
  const [reservationData, setReservationData] = useState(null);
  const [reserveLoading, setReserveLoading] = useState(false);

  const handleToggle = useCallback((id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= MAX_SEATS) {
        toast.warn(`Maximum ${MAX_SEATS} seats allowed per booking.`);
        return prev;
      }
      return [...prev, id];
    });
  }, [toast]);

  const handleClear = useCallback(() => {
    setSelectedIds([]);
    toast.info('Selection cleared.');
  }, [toast]);

  const handleReserve = async () => {
    setReserveLoading(true);
    try {
      const data = await reserveSeats(selectedIds);
      setReservationData(data);
      toast.success(`${selectedIds.length} seat(s) reserved! Complete payment within 2 minutes.`);
    } catch (err) {
      toast.error(err.message || 'Could not reserve seats. Please try again.');
      await refresh();
    } finally {
      setReserveLoading(false);
    }
  };

  const handlePaymentDone = async () => {
    setReservationData(null);
    setSelectedIds([]);
    await refresh();
  };

  const handleConfirmed = (confirmedSeats, total) => {
    addBooking(confirmedSeats, total);
  };

  const currentStep = reservationData ? 'pay' : selectedIds.length > 0 ? 'reserve' : 'select';

  if (reservationData) {
    return (
      <div style={{ background: '#010409', minHeight: '100vh' }}>
        <Header />
        <PaymentScreen
          reservationData={reservationData}
          seats={seats}
          onDone={handlePaymentDone}
          onConfirmed={handleConfirmed}
        />
      </div>
    );
  }

  return (
    <div style={{ background: '#010409', minHeight: '100vh', color: '#e6edf3' }}>
      <Header />

      {/* Step indicator */}
      <div style={{ background: '#0d1117', borderBottom: '1px solid #21262d' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {error && (
          <div style={{
            background: '#ff6b6b22', border: '1px solid #ff6b6b44',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            color: '#ff7b72', fontSize: 14,
          }}>
            ⚠ Could not load seats: {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Seat grid */}
          <div style={{ flex: 1, minWidth: 340 }}>
            <SectionTitle>Select Your Seats</SectionTitle>
            {loading ? (
              <div style={{ color: '#555', fontSize: 13 }}>Loading seats…</div>
            ) : (
              <SeatGrid
                seats={seats}
                selectedIds={selectedIds}
                onToggle={handleToggle}
              />
            )}
          </div>

          {/* Sidebar */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <SectionTitle>Your Selection</SectionTitle>
            <BookingSummary
              seats={seats}
              selectedIds={selectedIds}
              onReserve={handleReserve}
              onClear={handleClear}
              loading={reserveLoading}
            />
            <BookingHistory history={history} onClear={clearHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <div style={{
    borderBottom: '1px solid #21262d',
    padding: '13px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#0d1117',
  }}>
    <span style={{ fontSize: 20 }}>🎟️</span>
    <span style={{ fontWeight: 700, fontSize: 17, color: '#e6edf3' }}>SeatBook</span>
    <div style={{
      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: '#3fb950',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#3fb950',
        display: 'inline-block',
        boxShadow: '0 0 6px #3fb95088',
      }} />
      Live
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{ color: '#e6edf3', fontSize: 14, fontWeight: 700, marginBottom: 14, marginTop: 0, letterSpacing: 0.5 }}>
    {children}
  </h2>
);

export default App;
