import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider } from './context/ToastContext';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
