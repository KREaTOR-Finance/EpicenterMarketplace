import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Types
interface Wallet {
  name: string;
  icon: string;
  installed: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getAddress: () => Promise<string | null>;
  getBalance: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  network: 'SEI' | 'Ethereum' | 'Solana';
}

const WalletContext = createContext<Wallet | null>(null);

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

  const signMessageSolana = async (_message: string) => {
    console.log('Solana message signing not implemented');
    return 'signed_message_placeholder';
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

  const contextValue: Wallet = {
    name: activeWallet === 'seismic' ? 'SeismicWallet' :
           activeWallet === 'metamask' ? 'MetaMask' :
           'Solana',
    icon: activeWallet === 'seismic' ? '🔗' :
          activeWallet === 'metamask' ? '🦊' :
          '🐳',
    installed: true, // Assuming all are installed for now
    connect: async () => {
      if (activeWallet === 'seismic') {
        await connectSeismicWallet();
      } else if (activeWallet === 'metamask') {
        await connectMetaMask();
      } else if (activeWallet === 'solana') {
        await connectSolana();
      }
    },
    disconnect: async () => {
      if (activeWallet === 'seismic') {
        disconnectSeismicWallet();
      } else if (activeWallet === 'metamask') {
        disconnectMetaMask();
      } else if (activeWallet === 'solana') {
        disconnectSolana();
      }
    },
    getAddress: async () => {
      if (activeWallet === 'seismic') {
        return seismicWallet.address;
      } else if (activeWallet === 'metamask') {
        return metaMask.address;
      } else if (activeWallet === 'solana') {
        return solana.address;
      }
      return null;
    },
    getBalance: async () => {
      if (activeWallet === 'seismic') {
        if (!seismicWallet.provider) return '0';
        const balance = await seismicWallet.provider.getBalance(seismicWallet.address || '0x0');
        return ethers.utils.formatEther(balance);
      } else if (activeWallet === 'metamask') {
        if (!metaMask.provider) return '0';
        const balance = await metaMask.provider.getBalance(metaMask.address || '0x0');
        return ethers.utils.formatEther(balance);
      } else if (activeWallet === 'solana') {
        // Solana balance is not directly available via ethers.js
        // This would require a different library or direct RPC call
        return 'N/A';
      }
      return '0';
    },
    signMessage: async (message: string) => {
      if (activeWallet === 'seismic') {
        return signMessageSeismic(message);
      } else if (activeWallet === 'metamask') {
        return signMessageMetaMask(message);
      } else if (activeWallet === 'solana') {
        return signMessageSolana(message);
      }
      throw new Error('No wallet connected');
    },
    network: activeWallet === 'seismic' ? 'SEI' :
             activeWallet === 'metamask' ? 'Ethereum' :
             'Solana',
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Wallet Connection Component
export const WalletConnect: React.FC = () => {
  const wallet = useWallet();

  if (!wallet) {
    return (
      <div className="flex items-center space-x-3">
        <button className="px-4 py-2 rounded-lg transition-colors bg-[#e11d2a] text-white hover:bg-[#c11825] flex items-center space-x-2">
          <span>Connect SeismicWallet</span>
          <span className="text-xs px-2 py-1 rounded bg-[#c11825]">Primary</span>
        </button>
        <div className="flex items-center space-x-2">
          <button
            className="w-8 h-8 rounded-lg transition-colors flex items-center justify-center bg-orange-500 hover:bg-orange-600"
            title="Connect MetaMask"
          >
            🦊
          </button>
          <button
            className="w-8 h-8 rounded-lg transition-colors flex items-center justify-center bg-gray-400 hover:bg-gray-500"
            title="Connect Phantom (Solana)"
          >
            🐳
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-mono">{wallet.icon} {wallet.name}</span>
      <button
        onClick={wallet.disconnect}
        className="px-3 py-1 text-sm rounded transition-colors bg-red-500 text-white hover:bg-red-600"
      >
        Disconnect
      </button>
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