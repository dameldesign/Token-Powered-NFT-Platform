import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, Image, CreditCard, User } from 'lucide-react';
import { shortenAddress } from '../../lib/utils';

interface NavbarProps {
  account: string;
  tokenBalance: string;
  tokenSymbol: string;
}

const Navbar: React.FC<NavbarProps> = ({ account, tokenBalance, tokenSymbol }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Gallery', icon: <Palette className="w-5 h-5" /> },
    { path: '/mint', label: 'Mint NFT', icon: <Image className="w-5 h-5" /> },
    { path: '/rewards', label: 'Rewards', icon: <CreditCard className="w-5 h-5" /> },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-900 to-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-purple-300" />
              <span className="text-xl font-bold">ArtRewards</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-purple-700 text-white'
                    : 'text-purple-100 hover:bg-purple-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Account info */}
          {account ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center rounded-full bg-purple-700 px-3 py-1">
                <CreditCard className="h-4 w-4 mr-1 text-purple-300" />
                <span className="text-sm font-medium">
                  {tokenBalance} {tokenSymbol}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 rounded-full bg-purple-700 px-3 py-1">
                <User className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-medium">{shortenAddress(account)}</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse rounded-full bg-purple-700 px-3 py-1">
              <span className="text-sm">Connect Wallet</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden border-t border-purple-700">
        <div className="flex justify-between px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 px-3 py-2 text-xs font-medium transition-colors ${
                location.pathname === item.path
                  ? 'text-white'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;