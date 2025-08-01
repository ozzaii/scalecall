import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// API keys are already embedded in the services
// No need to set them from environment variables

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);