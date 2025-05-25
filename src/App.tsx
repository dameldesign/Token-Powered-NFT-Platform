import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import WalletConnect from './components/WalletConnect';
import GalleryPage from './pages/GalleryPage';
import MintPage from './pages/MintPage';
import RewardsPage from './pages/RewardsPage';

import { connectWallet, getTokenInfo } from './services/blockchain';
import type { TokenInfo } from './contracts/types';

function App() {
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    name: 'Creator Token',
    symbol: 'CRT',
    decimals: 18,
    balance: '0',
  });

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setAccount(address);
      
      // Get token info
      const info = await getTokenInfo(address);
      setTokenInfo(info);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error instanceof Error) {
        toast.error(`Failed to connect wallet: ${error.message}`);
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // Update token info
          getTokenInfo(accounts[0])
            .then((info) => {
              setTokenInfo(info);
            })
            .catch((error) => {
              console.error('Error getting token info:', error);
            });
        } else {
          setAccount('');
          setTokenInfo({
            name: 'Creator Token',
            symbol: 'CRT',
            decimals: 18,
            balance: '0',
          });
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
      // Check if already connected
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleConnectWallet();
          }
        })
        .catch((error: any) => {
          console.error('Error checking accounts:', error);
        });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar
          account={account}
          tokenBalance={tokenInfo.balance}
          tokenSymbol={tokenInfo.symbol}
        />
        
        <main className="flex-grow">
          {!account ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <WalletConnect
                onConnect={handleConnectWallet}
                isConnecting={isConnecting}
              />
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<GalleryPage />} />
              <Route path="/mint" element={<MintPage />} />
              <Route
                path="/rewards"
                element={
                  <RewardsPage
                    account={account}
                    tokenBalance={tokenInfo.balance}
                    tokenSymbol={tokenInfo.symbol}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ArtRewards - Built with ❤️ on Lisk
            </p>
          </div>
        </footer>
      </div>
      
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;