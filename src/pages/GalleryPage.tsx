import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import NFTCard from '../components/NFTCard';
import { getAllNFTs } from '../services/blockchain';
import type { NFTItem } from '../contracts/types';

const GalleryPage: React.FC = () => {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNfts, setFilteredNfts] = useState<NFTItem[]>([]);
  
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setIsLoading(true);
        const allNfts = await getAllNFTs();
        setNfts(allNfts);
        setFilteredNfts(allNfts);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load NFTs. Please make sure your wallet is connected.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNFTs();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNfts(nfts);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = nfts.filter((nft) => {
      return (
        nft.tokenId.toString().includes(term) ||
        nft.creator.toLowerCase().includes(term) ||
        nft.owner.toLowerCase().includes(term)
      );
    });
    
    setFilteredNfts(filtered);
  }, [searchTerm, nfts]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">NFT Gallery</h1>
          <p className="text-gray-600 mt-1">
            Discover and collect unique digital artworks
          </p>
        </div>
        
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or address..."
              className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-lg shadow-md h-80">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 text-lg">{error}</p>
          <p className="mt-2 text-gray-600">Please try again later or connect your wallet</p>
        </div>
      ) : filteredNfts.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No NFTs found</h3>
          {searchTerm ? (
            <p className="text-gray-600">No results match your search criteria</p>
          ) : (
            <p className="text-gray-600">Be the first to mint an NFT!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNfts.map((nft) => (
            <NFTCard key={nft.tokenId} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;