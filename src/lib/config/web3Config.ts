/* eslint-disable @typescript-eslint/no-explicit-any */
export const web3Config = {
  networks: {
    liskSepolia: {
      chainId: 4202,
      name: "Lisk Sepolia Testnet",
      rpcUrl: (import.meta as any).env.VITE_LISK_SEPOLIA_RPC_URL || "https://rpc.sepolia-api.lisk.com",
      blockExplorer: "https://sepolia-blockscout.lisk.com",
      nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "ETH",
        decimals: 18
      }
    },
    hardhat: {
      chainId: 31337,
      name: "Hardhat Local",
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: "",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      }
    }
  },
  
  contracts: {
    creatorToken: (import.meta as any).env.VITE_CREATOR_TOKEN_ADDRESS || "",
    artNFT: (import.meta as any).env.VITE_ART_NFT_ADDRESS || ""
  },

  // Contract constants from your ArtNFT.sol
  CREATOR_REWARD: "10000000000000000000" // 10 tokens in wei (10 * 10^18)
};
export type NetworkName = keyof typeof web3Config.networks;
export type Network = typeof web3Config.networks[NetworkName];

export default web3Config;
