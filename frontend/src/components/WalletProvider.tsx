import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

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
  const [seismicWallet, setSeismicWallet] = useState({
    isConnected: false,
    address: null as string | null,
    provider: null as ethers.providers.Web3Provider | null,
  });

  const [metaMask, setMetaMask] = useState({
    isConnected: false,
    address: null as string | null,
    provider: null as ethers.providers.Web3Provider | null,
  });

  const [solana, setSolana] = useState({
    isConnected: false,
    address: null as string | null,
  });

  const [activeWallet, setActiveWallet] = useState<'seismic' | 'metamask' | 'solana' | null>('seismic');

  // Check if SeismicWallet is available
  const isSeismicWalletAvailable = () => {
    return typeof window !== 'undefined' && window.seismicWallet;
  };

  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // SeismicWallet functions
  const connectSeismicWallet = async () => {
    if (!isSeismicWalletAvailable()) {
      // Fallback to MetaMask if SeismicWallet is not available
      if (isMetaMaskAvailable()) {
        await connectMetaMask();
        setActiveWallet('metamask');
        return;
      }
      throw new Error('SeismicWallet not installed. Please install SeismicWallet extension.');
    }

    try {
      const accounts = await window.seismicWallet.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.seismicWallet);
        setSeismicWallet({
          isConnected: true,
          address: accounts[0],
          provider,
        });
        setActiveWallet('seismic');
      }
    } catch (error) {
      console.error('Failed to connect SeismicWallet:', error);
      // Fallback to MetaMask
      if (isMetaMaskAvailable()) {
        await connectMetaMask();
        setActiveWallet('metamask');
      }
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
      throw new Error('SeismicWallet provider not found');
    }
    
    const signer = seismicWallet.provider.getSigner();
    return await signer.signMessage(message);
  };

  const signTransactionSeismic = async (transaction: any) => {
    if (!seismicWallet.provider) {
      throw new Error('SeismicWallet provider not found');
    }
    
    const signer = seismicWallet.provider.getSigner();
    return await signer.sendTransaction(transaction);
  };

  // MetaMask functions
  const connectMetaMask = async () => {
    if (!isMetaMaskAvailable()) {
      throw new Error('MetaMask not installed');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setMetaMask({
          isConnected: true,
          address: accounts[0],
          provider,
        });
        if (!activeWallet) {
          setActiveWallet('metamask');
        }
      }
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
      throw new Error('MetaMask provider not found');
    }
    
    const signer = metaMask.provider.getSigner();
    return await signer.signMessage(message);
  };

  const signTransactionMetaMask = async (transaction: any) => {
    if (!metaMask.provider) {
      throw new Error('MetaMask provider not found');
    }
    
    const signer = metaMask.provider.getSigner();
    return await signer.sendTransaction(transaction);
  };

  // Solana functions
  const connectSolana = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const response = await window.solana.connect();
        setSolana({
          isConnected: true,
          address: response.publicKey.toString(),
        });
        if (!activeWallet) {
          setActiveWallet('solana');
        }
      } catch (error) {
        console.error('Failed to connect Solana wallet:', error);
        throw error;
      }
    } else {
      throw new Error('Solana wallet not found');
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
    console.log('Solana message signing:', message);
    return 'signed_message_placeholder';
  };

  const signTransactionSolana = async (transaction: any) => {
    console.log('Solana transaction signing:', transaction);
    return 'signed_transaction_placeholder';
  };

  const switchWallet = (wallet: 'seismic' | 'metamask' | 'solana') => {
    setActiveWallet(wallet);
  };

  // Auto-connect on load
  useEffect(() => {
    const autoConnect = async () => {
      // Try SeismicWallet first
      if (isSeismicWalletAvailable()) {
        try {
          const accounts = await window.seismicWallet.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.seismicWallet);
            setSeismicWallet({
              isConnected: true,
              address: accounts[0],
              provider,
            });
            setActiveWallet('seismic');
            return;
          }
        } catch (error) {
          console.log('SeismicWallet auto-connect failed:', error);
        }
      }

      // Fallback to MetaMask
      if (isMetaMaskAvailable()) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setMetaMask({
              isConnected: true,
              address: accounts[0],
              provider,
            });
            if (!seismicWallet.isConnected) {
              setActiveWallet('metamask');
            }
          }
        } catch (error) {
          console.log('MetaMask auto-connect failed:', error);
        }
      }
    };

    autoConnect();

    // Listen for account changes
    if (typeof window !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectSeismicWallet();
          disconnectMetaMask();
        } else {
          if (activeWallet === 'seismic' && window.seismicWallet) {
            setSeismicWallet(prev => ({
              ...prev,
              address: accounts[0],
            }));
          } else if (activeWallet === 'metamask' && window.ethereum) {
            setMetaMask(prev => ({
              ...prev,
              address: accounts[0],
            }));
          }
        }
      };

      if (window.seismicWallet) {
        window.seismicWallet.on('accountsChanged', handleAccountsChanged);
      }
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (window.seismicWallet) {
          window.seismicWallet.removeListener('accountsChanged', handleAccountsChanged);
        }
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
  const { seismicWallet, metaMask, solana, activeWallet } = useWallet();

  const handleConnectSeismic = async () => {
    try {
      await seismicWallet.connect();
    } catch (error) {
      console.error('Failed to connect SeismicWallet:', error);
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
        <span className="text-sm font-mono">
          {activeWallet === 'seismic' ? '🔗 SeismicWallet' :
           activeWallet === 'metamask' ? '🦊 MetaMask' :
           '🐳 Solana'} Connected
        </span>
        <span className="text-sm font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={handleDisconnect}
          className="px-3 py-1 text-sm rounded transition-colors bg-red-500 text-white hover:bg-red-600"
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
        className="px-4 py-2 rounded-lg transition-colors bg-[#e11d2a] text-white hover:bg-[#c11825] flex items-center space-x-2"
      >
        <span>Connect SeismicWallet</span>
        <span className="text-xs px-2 py-1 rounded bg-[#c11825]">Primary</span>
      </button>

      {/* Secondary Options - Small Icons */}
      <div className="flex items-center space-x-2">
        {/* MetaMask Icon */}
        <button
          onClick={handleConnectMetaMask}
          className="w-8 h-8 rounded-lg transition-colors flex items-center justify-center bg-orange-500 hover:bg-orange-600"
          title="Connect MetaMask"
        >
          🦊
        </button>

        {/* Phantom/Solana Icon */}
        <button
          onClick={handleConnectSolana}
          className="w-8 h-8 rounded-lg transition-colors flex items-center justify-center bg-gray-400 hover:bg-gray-500"
          title="Connect Phantom (Solana)"
        >
          🐳
        </button>
      </div>
    </div>
  );
};

// Type declarations for window
declare global {
  interface Window {
    seismicWallet?: any;
    ethereum?: any;
    solana?: any;
  }
} 