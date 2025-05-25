import { ethers } from 'ethers';
import type { TokenInfo, NFTItem, MintEvent } from '../contracts/types';
import { handleError } from '../lib/utils';

// Import ABI from artifacts
import CreatorTokenArtifact from '../artifacts/contracts/CreatorToken.sol/CreatorToken.json';
// import ArtNFTArtifact from '../artifacts/contracts/ArtNFT.sol/ArtNFT.json';
import ArtNFTArtifact from '../../contracts/ArtNFT.sol';

// This will be populated by the deployment script
let contractAddresses: { creatorToken: string; artNFT: string } = { 
  creatorToken: '', 
  artNFT: '' 
};

try {
  contractAddresses = require('../contracts/contractAddresses.json');
} catch (error) {
  console.warn('Contract addresses not found. Please deploy contracts first.');
}

// Initialize provider and signer
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let tokenContract: ethers.Contract | null = null;
let nftContract: ethers.Contract | null = null;

export async function connectWallet(): Promise<string> {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    signer = await provider.getSigner();
    
    // Initialize contracts
    if (contractAddresses.creatorToken && contractAddresses.artNFT) {
      tokenContract = new ethers.Contract(
        contractAddresses.creatorToken,
        CreatorTokenArtifact.abi,
        signer
      );
      
      nftContract = new ethers.Contract(
        contractAddresses.artNFT,
        ArtNFTArtifact.abi,
        signer
      );
    } else {
      throw new Error('Contract addresses not found');
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

export async function getTokenInfo(address: string): Promise<TokenInfo> {
  try {
    if (!tokenContract) {
      throw new Error('Token contract not initialized');
    }
    
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(address);
    
    return {
      name,
      symbol,
      decimals,
      balance: balance.toString()
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
}

export async function mintNFT(tokenURI: string): Promise<{ tokenId: number; transactionHash: string }> {
  try {
    if (!nftContract) {
      throw new Error('NFT contract not initialized');
    }
    
    const tx = await nftContract.mintNFT(tokenURI);
    const receipt = await tx.wait();
    
    // Find the NFTMinted event in the logs
    const mintEvent = receipt.logs
      .filter((log: any) => log.topics[0] === ethers.id('NFTMinted(uint256,address,string,uint256)'))
      .map((log: any) => {
        const parsedLog = nftContract.interface.parseLog(log);
        return {
          tokenId: Number(parsedLog?.args[0]),
          creator: parsedLog?.args[1],
          tokenURI: parsedLog?.args[2],
          rewardAmount: parsedLog?.args[3].toString()
        };
      })[0];
    
    return {
      tokenId: mintEvent.tokenId,
      transactionHash: receipt.hash
    };
  } catch (error) {
    throw new Error(handleError(error));
  }
}

export async function getNFTsByOwner(ownerAddress: string): Promise<NFTItem[]> {
  try {
    if (!nftContract || !provider) {
      throw new Error('NFT contract not initialized');
    }
    
    // We need to get all mint events and filter by owner
    const filter = nftContract.filters.NFTMinted();
    const events = await nftContract.queryFilter(filter);
    
    const nfts: NFTItem[] = [];
    
    for (const event of events) {
      const tokenId = Number(event.args?.[0]);
      const creator = event.args?.[1];
      const tokenURI = event.args?.[2];
      
      try {
        const owner = await nftContract.ownerOf(tokenId);
        
        if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
          nfts.push({
            tokenId,
            tokenURI,
            creator,
            owner
          });
        }
      } catch (error) {
        // Skip tokens that don't exist or have been burned
        console.warn(`Token ${tokenId} not found or burned`);
      }
    }
    
    return nfts;
  } catch (error) {
    console.error('Error getting NFTs by owner:', error);
    throw error;
  }
}

export async function getAllNFTs(): Promise<NFTItem[]> {
  try {
    if (!nftContract || !provider) {
      throw new Error('NFT contract not initialized');
    }
    
    // Get all mint events
    const filter = nftContract.filters.NFTMinted();
    const events = await nftContract.queryFilter(filter);
    
    const nfts: NFTItem[] = [];
    
    for (const event of events) {
      const tokenId = Number(event.args?.[0]);
      const creator = event.args?.[1];
      const tokenURI = event.args?.[2];
      
      try {
        const owner = await nftContract.ownerOf(tokenId);
        
        nfts.push({
          tokenId,
          tokenURI,
          creator,
          owner
        });
      } catch (error) {
        // Skip tokens that don't exist or have been burned
        console.warn(`Token ${tokenId} not found or burned`);
      }
    }
    
    return nfts;
  } catch (error) {
    console.error('Error getting all NFTs:', error);
    throw error;
  }
}

export async function getMintEvents(): Promise<MintEvent[]> {
  try {
    if (!nftContract || !provider) {
      throw new Error('NFT contract not initialized');
    }
    
    // Get all mint events
    const filter = nftContract.filters.NFTMinted();
    const events = await nftContract.queryFilter(filter);
    
    const mintEvents: MintEvent[] = [];
    
    for (const event of events) {
      const tokenId = Number(event.args?.[0]);
      const creator = event.args?.[1];
      const tokenURI = event.args?.[2];
      const rewardAmount = event.args?.[3].toString();
      const blockNumber = event.blockNumber;
      
      // Get block timestamp
      const block = await provider.getBlock(blockNumber);
      const timestamp = block ? Number(block.timestamp) : 0;
      
      mintEvents.push({
        tokenId,
        creator,
        tokenURI,
        rewardAmount,
        transactionHash: event.transactionHash,
        timestamp
      });
    }
    
    // Sort by timestamp (newest first)
    mintEvents.sort((a, b) => b.timestamp - a.timestamp);
    
    return mintEvents;
  } catch (error) {
    console.error('Error getting mint events:', error);
    throw error;
  }
}