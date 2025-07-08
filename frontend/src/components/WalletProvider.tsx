import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../contexts/ThemeContext';

// Types
export interface WalletContextType {
  // SEI Wallet (Primary)
  seismicWallet: {
    isConnected: boolean;
    address: string | null;
    provider: ethers.providers.Web3Provider | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signMessage: (message: string) => Promise<string>;
    signTransaction: (transaction: any) => Promise<any>;
  };
  
  // MetaMask (Fallback for SEI)
  metaMask: {
    isConnected: boolean;
    address: string | null;
    provider: ethers.providers.Web3Provider | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signMessage: (message: string) => Promise<string>;
    signTransaction: (transaction: any) => Promise<any>;
  };
  
  // Solana (Secondary)
  solana: {
    isConnected: boolean;
    address: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signMessage: (message: string) => Promise<string>;
    signTransaction: (transaction: any) => Promise<any>;
  };
  
  // Current active wallet
  activeWallet: 'seismic' | 'metamask' | 'solana' | null;
  switchWallet: (wallet: 'seismic' | 'metamask' | 'solana') => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // SEI Wallet State
  const [seismicWallet, setSeismicWallet] = useState({
    isConnected: false,
    address: null as string | null,
    provider: null as ethers.providers.Web3Provider | null,
  });

  // MetaMask State
  const [metaMask, setMetaMask] = useState({
    isConnected: false,
    address: null as string | null,
    provider: null as ethers.providers.Web3Provider | null,
  });

  // Solana State
  const [solana, setSolana] = useState({
    isConnected: false,
    address: null as string | null,
  });

  // Active wallet
  const [activeWallet, setActiveWallet] = useState<'seismic' | 'metamask' | 'solana' | null>(null);

  // Check if SeismicWallet is available
  const isSeismicWalletAvailable = () => {
    return typeof window !== 'undefined' && window.seismicWallet;
  };

  // Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // SEI Wallet Methods
  const connectSeismicWallet = async () => {
    try {
      if (!isSeismicWalletAvailable()) {
        throw new Error('SeismicWallet not found. Please install SeismicWallet extension.');
      }

      const provider = new ethers.providers.Web3Provider(window.seismicWallet);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      setSeismicWallet({
        isConnected: true,
        address,
        provider,
      });

      setActiveWallet('seismic');
      
      // Store preference
      localStorage.setItem('preferredWallet', 'seismic');
      
      console.log('SeismicWallet connected:', address);
    } catch (error) {
      console.error('Failed to connect SeismicWallet:', error);
      throw error;
    }
  };

  const disconnectSeismicWallet = () => {
    setSeismicWallet({
      isConnected: false,
      address: null,
      provider: null,
    });
    
    if (activeWallet === 'seismic') {
      setActiveWallet(null);
    }
  };

  const signMessageSeismic = async (message: string) => {
    if (!seismicWallet.provider) {
      throw new Error('SeismicWallet not connected');
    }
    
    const signer = seismicWallet.provider.getSigner();
    return await signer.signMessage(message);
  };

  const signTransactionSeismic = async (transaction: any) => {
    if (!seismicWallet.provider) {
      throw new Error('SeismicWallet not connected');
    }
    
    const signer = seismicWallet.provider.getSigner();
    return await signer.signTransaction(transaction);
  };

  // MetaMask Methods
  const connectMetaMask = async () => {
    try {
      if (!isMetaMaskAvailable()) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      setMetaMask({
        isConnected: true,
        address,
        provider,
      });

      setActiveWallet('metamask');
      
      // Store preference
      localStorage.setItem('preferredWallet', 'metamask');
      
      console.log('MetaMask connected:', address);
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      throw error;
    }
  };

  const disconnectMetaMask = () => {
    setMetaMask({
      isConnected: false,
      address: null,
      provider: null,
    });
    
    if (activeWallet === 'metamask') {
      setActiveWallet(null);
    }
  };

  const signMessageMetaMask = async (message: string) => {
    if (!metaMask.provider) {
      throw new Error('MetaMask not connected');
    }
    
    const signer = metaMask.provider.getSigner();
    return await signer.signMessage(message);
  };

  const signTransactionMetaMask = async (transaction: any) => {
    if (!metaMask.provider) {
      throw new Error('MetaMask not connected');
    }
    
    const signer = metaMask.provider.getSigner();
    return await signer.signTransaction(transaction);
  };

  // Solana Methods (Simplified)
  const connectSolana = async () => {
    try {
      // This would integrate with Solana wallet adapters
      // For now, just set a placeholder
      setSolana({
        isConnected: true,
        address: 'placeholder-solana-address',
      });
      
      setActiveWallet('solana');
      console.log('Solana wallet connected');
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      throw error;
    }
  };

  const disconnectSolana = () => {
    setSolana({
      isConnected: false,
      address: null,
    });
    
    if (activeWallet === 'solana') {
      setActiveWallet(null);
    }
  };

  const signMessageSolana = async (message: string) => {
    if (!solana.isConnected) {
      throw new Error('Solana wallet not connected');
    }
    
    // Implement Solana message signing
    return 'placeholder-solana-signature';
  };

  const signTransactionSolana = async (transaction: any) => {
    if (!solana.isConnected) {
      throw new Error('Solana wallet not connected');
    }
    
    // Implement Solana transaction signing
    return transaction;
  };

  // Switch wallet function
  const switchWallet = (wallet: 'seismic' | 'metamask' | 'solana') => {
    // Disconnect current wallet
    if (activeWallet === 'seismic') {
      disconnectSeismicWallet();
    } else if (activeWallet === 'metamask') {
      disconnectMetaMask();
    } else if (activeWallet === 'solana') {
      disconnectSolana();
    }

    // Connect new wallet
    if (wallet === 'seismic') {
      connectSeismicWallet();
    } else if (wallet === 'metamask') {
      connectMetaMask();
    } else if (wallet === 'solana') {
      connectSolana();
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    const preferredWallet = localStorage.getItem('preferredWallet');
    
    if (preferredWallet === 'seismic' && isSeismicWalletAvailable()) {
      connectSeismicWallet().catch(console.error);
    } else if (preferredWallet === 'metamask' && isMetaMaskAvailable()) {
      connectMetaMask().catch(console.error);
    }
  }, []);

  // Listen for wallet changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          if (activeWallet === 'seismic') {
            disconnectSeismicWallet();
          } else if (activeWallet === 'metamask') {
            disconnectMetaMask();
          }
        } else {
          // User switched accounts
          if (activeWallet === 'seismic') {
            setSeismicWallet(prev => ({ ...prev, address: accounts[0] }));
          } else if (activeWallet === 'metamask') {
            setMetaMask(prev => ({ ...prev, address: accounts[0] }));
          }
        }
      };

      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [activeWallet]);

  const contextValue: WalletContextType = {
    seismicWallet: {
      isConnected: seismicWallet.isConnected,
      address: seismicWallet.address,
      provider: seismicWallet.provider,
      connect: connectSeismicWallet,
      disconnect: disconnectSeismicWallet,
      signMessage: signMessageSeismic,
      signTransaction: signTransactionSeismic,
    },
    metaMask: {
      isConnected: metaMask.isConnected,
      address: metaMask.address,
      provider: metaMask.provider,
      connect: connectMetaMask,
      disconnect: disconnectMetaMask,
      signMessage: signMessageMetaMask,
      signTransaction: signTransactionMetaMask,
    },
    solana: {
      isConnected: solana.isConnected,
      address: solana.address,
      connect: connectSolana,
      disconnect: disconnectSolana,
      signMessage: signMessageSolana,
      signTransaction: signTransactionSolana,
    },
    activeWallet,
    switchWallet,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Wallet Connection Component
export const WalletConnect: React.FC = () => {
  const { seismicWallet, metaMask, solana, activeWallet, switchWallet } = useWallet();
  const { isDark } = useTheme();

  const handleConnectSeismic = async () => {
    try {
      await seismicWallet.connect();
    } catch (error) {
      console.error('Failed to connect SeismicWallet:', error);
      // Fallback to MetaMask if SeismicWallet fails
      if (isMetaMaskAvailable()) {
        try {
          await metaMask.connect();
        } catch (fallbackError) {
          console.error('Failed to connect MetaMask:', fallbackError);
        }
      }
    }
  };

  const handleConnectMetaMask = async () => {
    try {
      await metaMask.connect();
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
    }
  };

  const handleConnectSolana = async () => {
    try {
      await solana.connect();
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
    }
  };

  const handleDisconnect = () => {
    if (activeWallet === 'seismic') {
      seismicWallet.disconnect();
    } else if (activeWallet === 'metamask') {
      metaMask.disconnect();
    } else if (activeWallet === 'solana') {
      solana.disconnect();
    }
  };

  if (activeWallet) {
    const address = 
      activeWallet === 'seismic' ? seismicWallet.address :
      activeWallet === 'metamask' ? metaMask.address :
      solana.address;

    return (
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {activeWallet === 'seismic' ? 'SeismicWallet' :
           activeWallet === 'metamask' ? 'MetaMask' :
           'Solana'} Connected
        </span>
        <span className={`text-sm font-mono ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={handleDisconnect}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            isDark 
              ? 'bg-[#e11d2a] text-white hover:bg-[#c11825]' 
              : 'bg-[#e11d2a] text-white hover:bg-[#c11825]'
          }`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Primary: SeismicWallet - Main Button */}
      <button
        onClick={handleConnectSeismic}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
          isDark 
            ? 'bg-[#e11d2a] text-white hover:bg-[#c11825]' 
            : 'bg-[#e11d2a] text-white hover:bg-[#c11825]'
        }`}
      >
        <span>Connect SeismicWallet</span>
        <span className={`text-xs px-2 py-1 rounded ${
          isDark ? 'bg-[#c11825]' : 'bg-[#c11825]'
        }`}>Primary</span>
      </button>

      {/* Secondary Options - Small Icons */}
      <div className="flex items-center space-x-2">
        {/* MetaMask Icon */}
        <button
          onClick={handleConnectMetaMask}
          className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
            isDark 
              ? 'bg-[#333] hover:bg-[#444] border border-[#555]' 
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
          title="Connect MetaMask"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 2.773-.522.785-.261 1.177-.087.783h-1.565l-.087-.783-.261-1.177-.522-.785-1.84-2.773L12 7.226l1.362.935z"/>
          </svg>
        </button>

        {/* Phantom/Solana Icon */}
        <button
          onClick={handleConnectSolana}
          className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${
            isDark 
              ? 'bg-[#222] hover:bg-[#333] border border-[#444]' 
              : 'bg-gray-400 hover:bg-gray-500'
          }`}
          title="Connect Phantom (Solana)"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 2C7.26 2 3 6.26 3 11.5S7.26 21 12.5 21s9.5-4.26 9.5-9.5S17.74 2 12.5 2zm4.5 9.5c0 2.49-2.01 4.5-4.5 4.5S8 13.99 8 11.5 10.01 7 12.5 7s4.5 2.01 4.5 4.5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Helper function
const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum;
};

// Type declarations for window
declare global {
  interface Window {
    seismicWallet?: any;
    ethereum?: any;
  }
} 