export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface NFTItem {
  tokenId: number;
  tokenURI: string;
  creator: string;
  owner: string;
  metadata?: NFTMetadata;
}

export interface MintEvent {
  tokenId: number;
  creator: string;
  tokenURI: string;
  rewardAmount: string;
  transactionHash: string;
  timestamp: number;
}