import React, { useState } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { useToast } from '../context/ToastContext';
import { confirmBooking, releaseSeats } from '../services/api';
import StepIndicator from '../components/StepIndicator';

const PaymentScreen = ({ reservationData, seats, onDone, onConfirmed }) => {
  const { reservedSeats, expiresAt } = reservationData;
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const selectedSeats = seats.filter(s => reservedSeats.includes(s.id));
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleExpire = async () => {
    if (status !== 'pending') return;
    setStatus('expired');
    toast.warn('Your reservation expired — seats have been released.');
    try { await releaseSeats(reservedSeats); } catch (_) {}
  };

  const { secondsLeft, formatted } = useCountdown(expiresAt, handleExpire);
  const urgentSeconds = secondsLeft !== null && secondsLeft < 30;

  const currentStep = status === 'pending' ? 'pay'
    : status === 'success' ? 'done'
    : 'pay';

  const handleSuccess = async () => {
    setLoading(true);
    try {
      await confirmBooking(reservedSeats);
      setStatus('success');
      toast.success(`🎉 Booking confirmed for ${reservedSeats.length} seat(s)!`);
      onConfirmed(selectedSeats, total);
    } catch (err) {
      setStatus('failed');
      toast.error(err.message || 'Payment confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFailed = async () => {
    setLoading(true);
    try {
      await releaseSeats(reservedSeats);
      setStatus('failed');
      toast.error('Payment failed. Seats have been released.');
    } catch (err) {
      setStatus('failed');
      toast.error(err.message || 'Could not release seats.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '20px auto', padding: '0 16px' }}>
      {/* Step indicator */}
      <div style={{ background: '#0d1117', borderRadius: 12, border: '1px solid #21262d', marginBottom: 16 }}>
        <StepIndicator currentStep={currentStep} />
      </div>

      <div style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: 16,
        padding: 28,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>
            {status === 'success' ? '✅' : status === 'expired' ? '⏰' : status === 'failed' ? '❌' : '💳'}
          </div>
          <h2 style={{ margin: 0, color: '#e6edf3', fontSize: 20 }}>
            {status === 'pending' ? 'Complete Payment'
             : status === 'success' ? 'Booking Confirmed!'
             : status === 'expired' ? 'Reservation Expired'
             : 'Payment Failed'}
          </h2>
        </div>

        {/* Seat chips */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 8, letterSpacing: 0.5 }}>RESERVED SEATS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedSeats.map(s => (
              <div key={s.id} style={{
                background: '#161b22', border: '1px solid #30363d',
                borderRadius: 8, padding: '6px 14px', textAlign: 'center',
              }}>
                <div style={{ color: '#4a9eff', fontWeight: 700, fontSize: 15 }}>{s.id}</div>
                <div style={{ color: '#666', fontSize: 11 }}>₹{s.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          borderTop: '1px solid #21262d', borderBottom: '1px solid #21262d',
          padding: '12px 0', marginBottom: 18,
        }}>
          <span style={{ color: '#888' }}>Total Amount</span>
          <span style={{ color: '#4a9eff', fontWeight: 700, fontSize: 22 }}>₹{total.toLocaleString()}</span>
        </div>

        {/* Countdown */}
        {status === 'pending' && (
          <div style={{
            textAlign: 'center', marginBottom: 22, padding: 14, borderRadius: 10,
            background: urgentSeconds ? '#ff6b6b11' : '#4a9eff11',
            border: `1px solid ${urgentSeconds ? '#ff6b6b44' : '#4a9eff44'}`,
          }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 2 }}>TIME REMAINING</div>
            <div style={{
              fontSize: 40, fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: urgentSeconds ? '#ff6b6b' : '#4a9eff',
            }}>
              {formatted}
            </div>
            {urgentSeconds && (
              <div style={{ color: '#ff9f43', fontSize: 12, marginTop: 4 }}>
                ⚡ Hurry! Reservation expiring soon.
              </div>
            )}
          </div>
        )}

        {/* Success message */}
        {status === 'success' && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, marginBottom: 18,
            background: '#23863622', border: '1px solid #238636',
            color: '#3fb950', fontSize: 14, textAlign: 'center',
          }}>
            Your seats are confirmed. Enjoy the show! 🎊
          </div>
        )}

        {/* Expired/Failed message */}
        {(status === 'expired' || status === 'failed') && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, marginBottom: 18,
            background: '#ff6b6b22', border: '1px solid #ff6b6b44',
            color: '#ff7b72', fontSize: 14, textAlign: 'center',
          }}>
            {status === 'expired'
              ? 'Your reservation timed out. Please select seats again.'
              : 'Payment was not completed. Seats have been released.'}
          </div>
        )}

        {/* Actions */}
        {status === 'pending' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSuccess} disabled={loading} style={{
              flex: 1, padding: '13px 0', borderRadius: 8, border: 'none',
              background: '#238636', color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? '…' : '✓ Payment Success'}
            </button>
            <button onClick={handleFailed} disabled={loading} style={{
              flex: 1, padding: '13px 0', borderRadius: 8, border: 'none',
              background: '#da3633', color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? '…' : '✗ Payment Failed'}
            </button>
          </div>
        )}

        {status !== 'pending' && (
          <button onClick={onDone} style={{
            width: '100%', padding: '13px 0', borderRadius: 8, border: 'none',
            background: '#21262d', color: '#e6edf3', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
          }}>
            ← Back to Seat Selection
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentScreen;
