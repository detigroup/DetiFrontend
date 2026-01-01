import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './src/i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Wrap app in ErrorBoundary to catch render-time errors and show a useful fallback UI */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);