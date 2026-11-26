import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode runs extra checks in development (e.g. double-invokes effects)
// to catch bugs early. It has no effect in the production build.
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
