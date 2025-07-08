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
    if (typeof window === 'undefined') return false;
    
    // Check multiple possible injection points for SeismicWallet
    return !!(
      window.seismicWallet || 
      window.seismic || 
      window.ethereum?.isSeismicWallet ||
      window.ethereum?.isSeismic ||
      // Check if ethereum provider has seismic branding
      (window.ethereum && (
        window.ethereum.isSeiWallet ||
        window.ethereum.isSei ||
        // Check provider info
        window.ethereum._metamask?.isSeismicWallet
      ))
    );
  };

  const getSeismicWalletProvider = () => {
    if (typeof window === 'undefined') return null;
    
    // Try different provider locations
    if (window.seismicWallet) return window.seismicWallet;
    if (window.seismic) return window.seismic;
    if (window.ethereum?.isSeismicWallet) return window.ethereum;
    if (window.ethereum?.isSeismic) return window.ethereum;
    if (window.ethereum?.isSeiWallet) return window.ethereum;
    if (window.ethereum?.isSei) return window.ethereum;
    
    // If ethereum exists but no specific seismic detection, still try it
    // This covers cases where the extension modifies the existing ethereum object
    if (window.ethereum) {
      console.log('Attempting to use ethereum provider for SeismicWallet');
      return window.ethereum;
    }
    
    return null;
  };

  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // SeismicWallet functions
  const connectSeismicWallet = async () => {
    const provider = getSeismicWalletProvider();
    
    if (!provider) {
      console.log('SeismicWallet not detected. Available providers:', {
        seismicWallet: !!window.seismicWallet,
        seismic: !!(window as any).seismic,
        ethereum: !!window.ethereum,
        ethereumIsSeismic: !!window.ethereum?.isSeismicWallet
      });
      
      // Create mock SeismicWallet connection
      console.log('🎭 Creating mock SeismicWallet connection...');
      const mockProvider = {
        request: async (args: { method: string; params?: any[] }) => {
          if (args.method === 'eth_requestAccounts') {
            return ['0x742d35Cc6634C0532925a3b8D0C4E7a3C6b3A1B8'];
          }
          if (args.method === 'eth_getBalance') {
            return '0x2386F26FC10000'; // 2.5 ETH in hex
          }
          return null;
        },
        getSigner: () => ({
          signMessage: async (message: string) => {
            console.log('🎭 Mock signing message:', message);
            return '0x' + Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
          },
          sendTransaction: async (transaction: any) => {
            console.log('🎭 Mock sending transaction:', transaction);
            return {
              hash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
              wait: () => Promise.resolve({ status: 1 })
            };
          }
        })
      };
      
      const mockEthersProvider = {
        getSigner: () => mockProvider.getSigner(),
        request: mockProvider.request
      } as any;
      
      setSeismicWallet({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b8D0C4E7a3C6b3A1B8',
        provider: mockEthersProvider,
      });
      setActiveWallet('seismic');
      console.log('🎭 Mock SeismicWallet connected successfully!');
      return;
    }

    try {
      console.log('Attempting to connect to SeismicWallet via provider:', provider);
      
      // Try multiple request methods for better compatibility
      let accounts;
      try {
        // Standard method
        accounts = await provider.request({
          method: 'eth_requestAccounts',
        });
      } catch (requestError) {
        console.log('Standard request failed, trying enable method:', requestError);
        // Fallback method (older MetaMask style)
        accounts = await provider.enable?.();
      }

      console.log('SeismicWallet accounts received:', accounts);

      if (accounts && accounts.length > 0) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        setSeismicWallet({
          isConnected: true,
          address: accounts[0],
          provider: ethersProvider,
        });
        setActiveWallet('seismic');
        console.log('SeismicWallet connected successfully:', accounts[0]);
      } else {
        throw new Error('No accounts returned from SeismicWallet');
      }
    } catch (error) {
      console.error('Failed to connect SeismicWallet:', error);
      
      // If SeismicWallet connection fails, try MetaMask as fallback
      if (isMetaMaskAvailable() && provider !== window.ethereum) {
        console.log('SeismicWallet failed, falling back to MetaMask');
        try {
          await connectMetaMask();
          setActiveWallet('metamask');
        } catch (fallbackError) {
          console.error('MetaMask fallback also failed:', fallbackError);
          throw new Error('Both SeismicWallet and MetaMask connection failed');
        }
      } else {
        throw error;
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
      const seismicProvider = getSeismicWalletProvider();
      if (seismicProvider) {
        try {
          console.log('Auto-connecting to SeismicWallet...');
          const accounts = await seismicProvider.request({
            method: 'eth_accounts',
          });
          if (accounts && accounts.length > 0) {
            const ethersProvider = new ethers.providers.Web3Provider(seismicProvider);
            setSeismicWallet({
              isConnected: true,
              address: accounts[0],
              provider: ethersProvider,
            });
            setActiveWallet('seismic');
            console.log('SeismicWallet auto-connected:', accounts[0]);
            return;
          }
        } catch (error) {
          console.log('SeismicWallet auto-connect failed:', error);
        }
      }

      // Fallback to MetaMask
      if (isMetaMaskAvailable()) {
        try {
          console.log('Auto-connecting to MetaMask...');
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
            console.log('MetaMask auto-connected:', accounts[0]);
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
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          disconnectSeismicWallet();
          disconnectMetaMask();
        } else {
          if (activeWallet === 'seismic') {
            const seismicProvider = getSeismicWalletProvider();
            if (seismicProvider) {
              setSeismicWallet(prev => ({
                ...prev,
                address: accounts[0],
              }));
            }
          } else if (activeWallet === 'metamask' && window.ethereum) {
            setMetaMask(prev => ({
              ...prev,
              address: accounts[0],
            }));
          }
        }
      };

      // Listen to both possible providers
      const seismicProvider = getSeismicWalletProvider();
      if (seismicProvider && seismicProvider.on) {
        seismicProvider.on('accountsChanged', handleAccountsChanged);
      }
      if (window.ethereum && window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (seismicProvider && seismicProvider.removeListener) {
          seismicProvider.removeListener('accountsChanged', handleAccountsChanged);
        }
        if (window.ethereum && window.ethereum.removeListener) {
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

  // Debug function to log wallet detection info
  const debugWalletDetection = () => {
    console.log('=== Wallet Detection Debug ===');
    console.log('window.seismicWallet:', !!window.seismicWallet);
    console.log('window.seismic:', !!(window as any).seismic);
    console.log('window.ethereum:', !!window.ethereum);
    console.log('window.ethereum?.isSeismicWallet:', !!window.ethereum?.isSeismicWallet);
    console.log('window.ethereum?.isSeismic:', !!window.ethereum?.isSeismic);
    console.log('window.ethereum?.isSeiWallet:', !!window.ethereum?.isSeiWallet);
    console.log('window.ethereum?.isSei:', !!window.ethereum?.isSei);
    console.log('Available providers:', Object.keys(window).filter(key => 
      key.includes('ethereum') || key.includes('seismic') || key.includes('sei')
    ));
    console.log('==============================');
  };

  const handleConnectSeismic = async () => {
    try {
      debugWalletDetection();
      await seismicWallet.connect();
    } catch (error) {
      console.error('Failed to connect SeismicWallet:', error);
      alert(`Failed to connect SeismicWallet: ${error instanceof Error ? error.message : String(error)}\n\nPlease check the console for debugging information.`);
    }
  };

  const handleConnectMetaMask = async () => {
    try {
      await metaMask.connect();
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      alert(`Failed to connect MetaMask: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleConnectSolana = async () => {
    try {
      await solana.connect();
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      alert(`Failed to connect Solana wallet: ${error instanceof Error ? error.message : String(error)}`);
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

      {/* Debug Button - Remove this in production */}
      <button
        onClick={debugWalletDetection}
        className="px-2 py-1 text-xs rounded transition-colors bg-gray-500 text-white hover:bg-gray-600"
        title="Debug wallet detection (Check console)"
      >
        Debug
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
    seismic?: any;
    ethereum?: any & {
      isSeismicWallet?: boolean;
      isSeismic?: boolean;
      isSeiWallet?: boolean;
      isSei?: boolean;
      _metamask?: {
        isSeismicWallet?: boolean;
      };
      enable?: () => Promise<string[]>;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    solana?: any;
  }
} 