import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import environment types
declare global {
  interface Window {
    ethereum: any;
  }
  
  interface ImportMeta {
    env: {
      VITE_NFT_STORAGE_KEY?: string;
      VITE_LISK_SEPOLIA_RPC_URL?: string;
      VITE_CONTRACT_ADDRESS_TOKEN?: string;
      VITE_CONTRACT_ADDRESS_NFT?: string;
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);