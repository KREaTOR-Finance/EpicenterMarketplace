import React, { createContext, useContext, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAssetPath } from '../utils/assets';

interface MockWalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  walletType: 'seismic' | null;
}

interface MockWalletContextType {
  walletState: MockWalletState;
  connectWallet: () => void;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const MockWalletContext = createContext<MockWalletContextType | undefined>(undefined);

export const useMockWallet = () => {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error('useMockWallet must be used within a MockWalletProvider');
  }
  return context;
};

export const MockWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<MockWalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    walletType: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setWalletState({
      isConnected: true,
      address: '0x742d35Cc6634C0532925a3b8D0C4E7a3C6b3A1B8',
      balance: 2.5,
      walletType: 'seismic',
    });
    
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      walletType: null,
    });
  };

  return (
    <MockWalletContext.Provider value={{
      walletState,
      connectWallet,
      disconnectWallet,
      isConnecting,
    }}>
      {children}
    </MockWalletContext.Provider>
  );
};

export const MockWalletConnect: React.FC = () => {
  const { walletState, connectWallet, disconnectWallet, isConnecting } = useMockWallet();
  const { isDark } = useTheme();

  if (walletState.isConnected) {
    return (
      <div className="flex items-center space-x-4">
        {/* Connected Status */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          isDark ? 'bg-[#181818] border border-[#333]' : 'bg-white border border-gray-300'
        }`}>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {walletState.balance} SEI
          </span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnectWallet}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isDark 
              ? 'bg-[#333] text-white hover:bg-[#444]' 
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
        isConnecting
          ? isDark ? 'bg-[#e11d2a]/50 text-white cursor-not-allowed' : 'bg-red-300 text-white cursor-not-allowed'
          : isDark ? 'bg-[#e11d2a] text-white hover:bg-[#c41625] hover:shadow-lg' : 'bg-[#e11d2a] text-white hover:bg-[#c41625] hover:shadow-lg'
      }`}
    >
      <img 
        src={getAssetPath('Seismic LOGO 2 32x32 px.png')}
        alt="SeismicWallet" 
        className="w-5 h-5"
      />
      <span>
        {isConnecting ? 'Connecting...' : 'Connect SeismicWallet'}
      </span>
      {isConnecting && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
    </button>
  );
}; 