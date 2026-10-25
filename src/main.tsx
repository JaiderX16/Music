import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@memoria-labs/liquid-glass/style.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
