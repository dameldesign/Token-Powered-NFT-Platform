import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getMintEvents } from '../services/blockchain';
import { formatBalance, shortenAddress } from '../lib/utils';
import type { MintEvent } from '../contracts/types';

const RewardsPage: React.FC<{
  account: string;
  tokenBalance: string;
  tokenSymbol: string;
}> = ({ account, tokenBalance, tokenSymbol }) => {
  const [events, setEvents] = useState<MintEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const mintEvents = await getMintEvents();
        setEvents(mintEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load reward events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  const myEvents = events.filter(
    (event) => event.creator.toLowerCase() === account.toLowerCase()
  );
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Creator Rewards</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-purple-100">Your Balance</h3>
              <CreditCard className="h-5 w-5 text-purple-200" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatBalance(tokenBalance)} {tokenSymbol}
            </div>
            <p className="text-sm text-purple-200">
              Earned from NFT creations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-700">Your NFTs</h3>
              <div className="bg-purple-100 p-1 rounded-md">
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {myEvents.length}
            </div>
            <p className="text-sm text-gray-500">
              Total NFTs created
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-700">Reward Rate</h3>
              <div className="bg-green-100 p-1 rounded-md">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              10 {tokenSymbol}
            </div>
            <p className="text-sm text-gray-500">
              Per NFT mint
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Reward History</h2>
        </div>
        
        {isLoading ? (
          <div className="px-6 py-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No rewards have been distributed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr
                    key={`${event.tokenId}-${event.transactionHash}`}
                    className={
                      event.creator.toLowerCase() === account.toLowerCase()
                        ? 'bg-purple-50'
                        : ''
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{event.tokenId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.creator.toLowerCase() === account.toLowerCase() ? (
                        <span className="text-purple-600 font-medium">You</span>
                      ) : (
                        shortenAddress(event.creator)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {formatDate(event.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-medium text-green-600">
                        {formatBalance(event.rewardAmount)} {tokenSymbol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <span className="truncate w-24">{event.transactionHash.substring(0, 10)}...</span>
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;