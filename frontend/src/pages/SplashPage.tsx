import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { MockWalletConnect } from '../components/MockWalletProvider';
import { getAssetPath } from '../utils/assets';

export const SplashPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <img 
                src={getAssetPath('Seismic LOGO 2 128x128 px.png')}
                alt="SeismicWallet Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
              />
            </div>
            
            {/* Main Heading */}
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="bg-gradient-to-r from-[#e11d2a] to-[#ff4444] bg-clip-text text-transparent">
                Seismic
              </span>{' '}
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                Epicenter
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              The premier cross-chain NFT marketplace built for the SEI ecosystem. 
              Trade NFTs with confidence using SeismicWallet.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
              <MockWalletConnect />
              <Link 
                to="/collections" 
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors text-center ${
                  isDark 
                    ? 'bg-[#181818] text-white hover:bg-[#222] border border-[#333]' 
                    : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Browse Collections
              </Link>
            </div>
            
            {/* Network Badge */}
            <div className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
              isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]'}`}></div>
              <span>Powered by SEI Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-12 sm:py-16 lg:py-24 ${isDark ? 'bg-[#111]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Why Choose Seismic Epicenter?
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Experience the future of NFT trading with our cutting-edge features
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-[#181818]' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Lightning Fast
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Built on SEI for instant transactions and minimal gas fees
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-[#181818]' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Secure Trading
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Advanced security with SeismicWallet integration and smart contracts
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-[#181818]' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Cross-Chain
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Support for multiple blockchains with seamless asset bridging
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-[#181818]' : 'bg-gray-50'}`}>
              <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Community Driven
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Built by creators, for creators with community governance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-12 sm:py-16 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div>
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`}>
                $8.7M
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Volume
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`}>
                32.1K
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Users
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`}>
                127.4K
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                NFTs Listed
              </div>
            </div>
            <div>
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-[#e11d2a]' : 'text-red-600'}`}>
                2.8K
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Collections
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-12 sm:py-16 lg:py-24 ${isDark ? 'bg-[#111]' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready to Start Trading?
          </h2>
          <p className={`text-base sm:text-lg mb-6 sm:mb-8 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Connect your SeismicWallet and explore the best NFT collections on SEI
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <MockWalletConnect />
            <Link 
              to="/create" 
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors text-center ${
                isDark 
                  ? 'bg-[#181818] text-white hover:bg-[#222] border border-[#333]' 
                  : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Create Your First NFT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}; 