import React, { useState, useEffect } from 'react';
import { ExternalLink, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { retrieveMetadata } from '../services/nftStorage';
import { shortenAddress } from '../lib/utils';
import type { NFTItem, NFTMetadata } from '../contracts/types';

interface NFTCardProps {
  nft: NFTItem;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const data = await retrieveMetadata(nft.tokenURI);
        setMetadata(data);
      } catch (err) {
        setError('Failed to load metadata');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetadata();
  }, [nft.tokenURI]);
  
  if (isLoading) {
    return (
      <Card className="min-h-[320px] flex items-center justify-center">
        <CardContent>
          <div className="animate-pulse flex flex-col items-center">
            <div className="bg-gray-200 h-40 w-full rounded-md mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !metadata) {
    return (
      <Card className="min-h-[320px] flex items-center justify-center">
        <CardContent>
          <div className="text-center text-red-500">
            <p>Error loading NFT</p>
            <p className="text-sm">{error || 'Metadata not available'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card hover className="min-h-[320px] flex flex-col transition-all duration-300">
      <div className="relative w-full pt-[100%] overflow-hidden bg-gray-100">
        <img
          src={metadata.image}
          alt={metadata.name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Not+Found';
          }}
        />
      </div>
      
      <CardContent className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {metadata.name || `NFT #${nft.tokenId}`}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
          {metadata.description || 'No description available'}
        </p>
        
        {metadata.attributes && metadata.attributes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {metadata.attributes.slice(0, 3).map((attr, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {attr.trait_type}: {attr.value}
              </span>
            ))}
            {metadata.attributes.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{metadata.attributes.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 pt-2 pb-3">
        <div className="w-full flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span title={nft.creator}>Creator: {shortenAddress(nft.creator)}</span>
          </div>
          
          <a
            href={`https://sepolia.etherscan.io/token/${contractAddresses.artNFT}?a=${nft.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-500 hover:text-purple-700 flex items-center"
          >
            <span className="mr-1">View</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;