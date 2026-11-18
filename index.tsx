import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const legacyHashRoute = window.location.hash;
if (legacyHashRoute.startsWith('#/')) {
  const legacyUrl = new URL(legacyHashRoute.slice(1), window.location.origin);
  const currentSearch = new URLSearchParams(window.location.search);
  currentSearch.forEach((value, key) => {
    if (!legacyUrl.searchParams.has(key)) legacyUrl.searchParams.append(key, value);
  });
  window.history.replaceState(null, '', `${legacyUrl.pathname}${legacyUrl.search}${legacyUrl.hash}`);
}

// Restore the previous route only when an embedded page reloads at its root.
const lastPath = sessionStorage.getItem('last_path');
if (
  lastPath?.startsWith('/')
  && window.location.pathname === '/'
  && !window.location.search
  && window.self !== window.top
) {
  window.history.replaceState(null, '', lastPath);
}



const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);