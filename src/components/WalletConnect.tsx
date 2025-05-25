import React from 'react';
import { Wallet } from 'lucide-react';
import Button from './ui/Button';

interface WalletConnectProps {
  onConnect: () => Promise<void>;
  isConnecting: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, isConnecting }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 bg-gradient-to-b from-purple-50 to-white rounded-lg shadow-sm">
      <div className="text-center max-w-md">
        <div className="bg-purple-100 p-4 rounded-full inline-block mb-6">
          <Wallet className="h-12 w-12 text-purple-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
        
        <p className="text-gray-600 mb-8">
          Connect your MetaMask wallet to start minting NFTs and earning creator tokens.
        </p>
        
        <Button
          onClick={onConnect}
          isLoading={isConnecting}
          className="w-full sm:w-auto"
          size="lg"
          icon={<Wallet className="h-5 w-5" />}
        >
          Connect MetaMask
        </Button>
        
        <p className="mt-6 text-sm text-gray-500">
          Don't have MetaMask?{' '}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            Download here
          </a>
        </p>
      </div>
    </div>
  );
};

export default WalletConnect;