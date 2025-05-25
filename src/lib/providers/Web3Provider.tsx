import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import web3Config, { NetworkName, Network } from '../config/web3Config';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  // Connection state
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Network info
  currentNetwork: Network | null;
  isCorrectNetwork: boolean;
  
  // Token balances
  creatorTokenBalance: string;
  ethBalance: string;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (networkName: NetworkName) => Promise<boolean>;
  
  // Contract helpers
  getContract: (address: string, abi: any) => ethers.Contract | null;
  getCreatorTokenContract: () => ethers.Contract | null;
  getArtNFTContract: () => ethers.Contract | null;
  
  // Contract interactions
  mintNFT: (tokenURI: string) => Promise<{ success: boolean; tokenId?: number; txHash?: string; error?: string }>;
  getCreatorTokenBalance: (address?: string) => Promise<string>;
  refreshBalances: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [creatorTokenBalance, setCreatorTokenBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");

  // Get current network info
  const currentNetwork = chainId 

    ? Object.values(web3Config.networks).find((network: Network) => network.chainId === chainId) || null    : null;

  const isCorrectNetwork = chainId === web3Config.networks.liskSepolia.chainId || 
                          chainId === web3Config.networks.hardhat.chainId;

  // Contract ABIs (you'll need to import these from your artifacts)
  const creatorTokenABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function rewardCreator(address to, uint256 amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
  ];

  const artNFTABI = [
    "function mintNFT(string memory tokenURI) returns (uint256)",
    "function getCreator(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 rewardAmount)"
  ];

  // Connect wallet function
  const connectWallet = async (): Promise<void> => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Store connection state
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = (): void => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setCreatorTokenBalance("0");
    setEthBalance("0");
    localStorage.removeItem('walletConnected');
  };

  // Switch network function
  const switchNetwork = async (networkName: NetworkName): Promise<boolean> => {
    if (!window.ethereum) return false;

    const network = web3Config.networks[networkName];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to wallet, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : [],
              nativeCurrency: network.nativeCurrency
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      } else {
        console.error('Error switching network:', error);
        return false;
      }
    }
  };

  // Get contract instance
  const getContract = (address: string, abi: any): ethers.Contract | null => {
    if (!signer || !address) return null;
    return new ethers.Contract(address, abi, signer);
  };

  // Get CreatorToken contract
  const getCreatorTokenContract = (): ethers.Contract | null => {
    return getContract(web3Config.contracts.creatorToken, creatorTokenABI);
  };

  // Get ArtNFT contract
  const getArtNFTContract = (): ethers.Contract | null => {
    return getContract(web3Config.contracts.artNFT, artNFTABI);
  };

  // Mint NFT function
  const mintNFT = async (tokenURI: string): Promise<{ success: boolean; tokenId?: number; txHash?: string; error?: string }> => {
    try {
      const artNFTContract = getArtNFTContract();
      if (!artNFTContract) {
        return { success: false, error: "Contract not available" };
      }

      const tx = await artNFTContract.mintNFT(tokenURI);
      const receipt = await tx.wait();

      // Find the NFTMinted event to get the token ID
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = artNFTContract.interface.parseLog(log);
          return parsed?.name === 'NFTMinted';
        } catch {
          return false;
        }
      });

      let tokenId;
      if (mintEvent) {
        const parsed = artNFTContract.interface.parseLog(mintEvent);
        tokenId = Number(parsed?.args?.tokenId);
      }

      // Refresh balances after minting
      await refreshBalances();

      return { 
        success: true, 
        tokenId, 
        txHash: receipt.hash 
      };
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      return { 
        success: false, 
        error: error.message || "Failed to mint NFT" 
      };
    }
  };

  // Get creator token balance
  const getCreatorTokenBalance = async (address?: string): Promise<string> => {
    try {
      const contract = getCreatorTokenContract();
      if (!contract || !account) return "0";
      
      const balance = await contract.balanceOf(address || account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return "0";
    }
  };

  // Refresh all balances
  const refreshBalances = async (): Promise<void> => {
    if (!account || !provider) return;

    try {
      // Get ETH balance
      const ethBal = await provider.getBalance(account);
      setEthBalance(ethers.formatEther(ethBal));

      // Get Creator Token balance
      const tokenBal = await getCreatorTokenBalance();
      setCreatorTokenBalance(tokenBal);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // Refresh balances when account or network changes
  useEffect(() => {
    if (isConnected && account && isCorrectNetwork) {
      refreshBalances();
    }
  }, [isConnected, account, chainId]);

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true' && window.ethereum) {
      connectWallet();
    }
  }, []);

  const contextValue: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    currentNetwork,
    isCorrectNetwork,
    creatorTokenBalance,
    ethBalance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getContract,
    getCreatorTokenContract,
    getArtNFTContract,
    mintNFT,
    getCreatorTokenBalance,
    refreshBalances
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use Web3 context
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Provider;
