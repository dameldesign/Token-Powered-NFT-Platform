# Token-Powered NFT Platform

A decentralized application where creators earn tokens when their NFTs are minted.

## Features

- Mint and collect NFTs representing digital artworks
- Creators earn ERC20 tokens as rewards when their NFTs are minted
- Connect with MetaMask wallet
- View NFT gallery and track creator rewards

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain Interaction**: ethers.js
- **Smart Contracts**: Solidity (ERC20 & ERC721)
- **File Storage**: IPFS via NFT.Storage
- **Development**: Hardhat for local development and deployment

## Smart Contracts

The platform includes two main contracts:

1. **CreatorToken (ERC20)** - The reward token distributed to creators
2. **ArtNFT (ERC721)** - The NFT collection representing digital artworks

## Getting Started

### Prerequisites

- Node.js (v16+)
- MetaMask wallet extension
- Lisk Sepolia testnet ETH (for gas fees)
- NFT.Storage API key

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd token-powered-nft-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file using the example:
   ```
   cp .env.example .env
   ```
   
4. Add your private key and NFT.Storage API key to the `.env` file

5. Compile the smart contracts:
   ```
   npm run compile
   ```

6. Deploy the contracts to Lisk Sepolia:
   ```
   npm run deploy:contracts
   ```

7. Start the development server:
   ```
   npm run dev
   ```

## Deployment

The smart contracts are deployed on the Lisk Sepolia testnet. The frontend can be deployed to Netlify or Vercel.

## License

MIT