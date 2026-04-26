import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Silently suppress specific iframe/browser extension errors that we cannot fix directly
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('fetch of #<Window>')) {
    e.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes("Pointer lock")) {
    e.preventDefault();
  }
});

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.PointerLockControls: Unable to use Pointer Lock API')) {
    return;
  }
  originalError(...args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    if (args[0].includes('THREE.Clock: This module has been deprecated')) return;
    if (args[0].includes('using deprecated parameters for the initialization function')) return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
