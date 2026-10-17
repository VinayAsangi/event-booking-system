const BASE_URL = 'http://localhost:4000/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data.data;
};

export const fetchSeats = () =>
  fetch(`${BASE_URL}/seats`).then(handleResponse);

export const reserveSeats = (seatIds) =>
  fetch(`${BASE_URL}/seats/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds }),
  }).then(handleResponse);

export const confirmBooking = (seatIds) =>
  fetch(`${BASE_URL}/seats/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds }),
  }).then(handleResponse);

export const releaseSeats = (seatIds) =>
  fetch(`${BASE_URL}/seats/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatIds }),
  }).then(handleResponse);
