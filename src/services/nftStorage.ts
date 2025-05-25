import { NFTStorage, File } from 'nft.storage';
import type { NFTMetadata } from '../contracts/types';

// Replace with your actual NFT.Storage API key
const NFT_STORAGE_KEY = import.meta.env.VITE_NFT_STORAGE_KEY || '';

const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY });

export async function storeNFT(
  imageFile: File,
  name: string,
  description: string,
  attributes: Array<{ trait_type: string; value: string }> = []
): Promise<string> {
  // First, we upload the image to IPFS
  const imageCid = await nftStorage.storeBlob(imageFile);
  const imageURI = `https://ipfs.io/ipfs/${imageCid}`;
  
  // Then, we create the metadata object
  const metadata: NFTMetadata = {
    name,
    description,
    image: imageURI,
    attributes
  };
  
  // Convert metadata to a JSON Blob and upload it
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const metadataCid = await nftStorage.storeBlob(metadataBlob);
  
  // Return the full tokenURI
  return `https://ipfs.io/ipfs/${metadataCid}`;
}

export async function retrieveMetadata(tokenURI: string): Promise<NFTMetadata> {
  try {
    const response = await fetch(tokenURI);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const metadata = await response.json();
    return metadata as NFTMetadata;
  } catch (error) {
    console.error('Error retrieving metadata:', error);
    throw error;
  }
}