import React from 'react';
import { Link } from 'react-router-dom';
import { useMockWallet } from '../components/MockWalletProvider';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FireIcon, 
  ShieldCheckIcon,
  LightningBoltIcon,
  CheckCircleIcon,
} from '@heroicons/react/outline';

export const HomePage: React.FC = () => {
  const { walletState, connectWallet, disconnectWallet } = useMockWallet();
  const { isDark } = useTheme();

  const features = [
    {
      icon: FireIcon,
      title: 'SEI-First Marketplace',
      description: 'Built specifically for the SEI blockchain with native SeismicWallet integration.',
      primary: true
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Trading',
      description: 'Advanced security with EIP-2981 royalties and lazy minting support.',
      primary: true
    },
    {
      icon: LightningBoltIcon,
      title: 'Fast Transactions',
      description: 'Lightning-fast NFT trading on SEI with minimal gas fees.',
      primary: true
    },
    {
      icon: CheckCircleIcon,
      title: 'Cross-Chain Support',
      description: 'Optional Solana integration for expanded NFT access.',
      primary: false
    }
  ];

  const stats = [
    { label: 'Total Volume', value: '$8.7M', change: '+24%' },
    { label: 'Active Users', value: '32.1K', change: '+18%' },
    { label: 'NFTs Listed', value: '127.4K', change: '+31%' },
    { label: 'Collections', value: '2.8K', change: '+12%' }
  ];

  const trendingCollections = [
    {
      id: 1,
      name: 'SEI Samurai',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
      floorPrice: '2.5 SEI',
      volume: '156.8 SEI',
      change: '+15.7%',
      verified: true
    },
    {
      id: 2,
      name: 'Cosmic Crystals',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=300&h=300&fit=crop',
      floorPrice: '1.8 SEI',
      volume: '89.2 SEI',
      change: '+8.3%',
      verified: true
    },
    {
      id: 3,
      name: 'Digital Dragons',
      image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&h=300&fit=crop',
      floorPrice: '4.2 SEI',
      volume: '234.7 SEI',
      change: '+22.1%',
      verified: false
    },
    {
      id: 4,
      name: 'SEI Legends',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      floorPrice: '3.1 SEI',
      volume: '178.9 SEI',
      change: '+12.9%',
      verified: true
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'sale',
      nft: 'SEI Samurai #4829',
      price: '3.2 SEI',
      buyer: '0x1a2b...f8d9',
      seller: '0x9f8e...2c1b',
      time: '2 min ago',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=60&h=60&fit=crop'
    },
    {
      id: 2,
      type: 'listing',
      nft: 'Cosmic Crystal #291',
      price: '1.8 SEI',
      seller: '0x7d6c...a4e3',
      time: '5 min ago',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=60&h=60&fit=crop'
    },
    {
      id: 3,
      type: 'sale',
      nft: 'Digital Dragon #1847',
      price: '5.1 SEI',
      buyer: '0x3e2d...b7f6',
      seller: '0x8c9b...5a7e',
      time: '8 min ago',
      image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=60&h=60&fit=crop'
    },
    {
      id: 4,
      type: 'offer',
      nft: 'SEI Legend #3756',
      price: '2.9 SEI',
      buyer: '0x6f5e...d3c2',
      time: '12 min ago',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className={`text-center py-16 rounded-2xl text-white ${
        isDark 
          ? 'bg-gradient-to-r from-[#e11d2a] to-[#111]' 
          : 'bg-gradient-to-r from-[#e11d2a] to-red-400'
      }`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {
        boxShadow: '0 2px 16px 0 #e11d2a33, 0 2px 12px 0 #e11d2a22'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Seismic Epicenter
          </h1>
          <p className={`text-xl md:text-2xl mb-8 ${
            isDark ? 'text-gray-100' : 'text-red-100'
          }`}>
            The premier NFT marketplace for the SEI ecosystem
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!walletState.isConnected ? (
              <button 
                onClick={connectWallet}
                className={`px-8 py-4 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  isDark 
                    ? 'bg-white text-[#e11d2a] hover:bg-gray-100' 
                    : 'bg-white text-[#e11d2a] hover:bg-red-50'
                }`}
              >
                <span>Connect SeismicWallet</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-100 text-red-800'
                }`}>Primary</span>
              </button>
            ) : (
            <Link
              to="/collections"
              className={`px-8 py-4 font-semibold rounded-lg transition-colors ${
                isDark 
                  ? 'bg-white text-[#e11d2a] hover:bg-gray-100' 
                  : 'bg-white text-[#e11d2a] hover:bg-red-50'
              }`}
            >
              Start Trading
            </Link>
            )}
          </div>
          
          {/* Wallet Status */}
          {walletState.isConnected && (
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <p className="text-sm">
                Connected with SeismicWallet
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-200' : 'text-red-200'}`}>
                {walletState.address}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Why Choose Seismic Epicenter?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border transition-all duration-300 ${
                feature.primary 
                  ? isDark 
                    ? 'bg-[#e11d2a]/10 border-[#e11d2a]/30 shadow-sei-glow' 
                    : 'bg-red-50 border-red-200 shadow-lg'
                  : isDark
                    ? 'bg-[#181818] border-[#333]'
                    : 'bg-white border-gray-200'
              }`}
                              style={feature.primary ? (
                  isDark ? {
                    boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
                  } : {
                    boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #e11d2a11'
                  }
                ) : {}}
            >
              <feature.icon className={`w-12 h-12 mb-4 ${
                feature.primary 
                  ? isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                feature.primary 
                  ? isDark ? 'text-white' : 'text-gray-900'
                  : isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${
                feature.primary 
                  ? isDark ? 'text-gray-300' : 'text-gray-600'
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {feature.description}
              </p>
              {!feature.primary && (
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  isDark ? 'bg-[#333] text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  Secondary
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className={`rounded-2xl p-8 ${isDark ? 'bg-[#181818] border border-[#333]' : 'bg-white shadow-lg border border-gray-200'}`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {
        boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #e11d2a11'
      }}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Marketplace Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>
                {stat.value}
              </div>
              <div className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {stat.label}
              </div>
              <div className={`text-xs ${isDark ? 'text-[#e11d2a]' : 'text-green-600'}`}>
                {stat.change} from last month
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Collections */}
      <section>
        <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Trending Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCollections.map((collection) => (
            <div
              key={collection.id}
              className={`rounded-xl overflow-hidden transition-all duration-300 group ${
                isDark 
                  ? 'bg-[#181818] border border-[#333] hover:border-[#e11d2a]/50' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
              style={isDark ? {
                boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
              } : {}}
            >
              <div className="relative">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {collection.verified && (
                  <div className={`absolute top-3 right-3 p-1 rounded-full ${isDark ? 'bg-[#e11d2a] text-white' : 'bg-[#e11d2a] text-white'}`}>
                    <ShieldCheckIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className={`font-semibold mb-2 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {collection.name}
                  {collection.verified && (
                    <ShieldCheckIcon className={`w-4 h-4 ml-1 ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`} />
                  )}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Floor Price:</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{collection.floorPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>24h Volume:</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{collection.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>24h Change:</span>
                    <span className={`font-medium ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>{collection.change}</span>
                  </div>
                </div>
                <button className={`w-full mt-4 font-medium py-2 px-4 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-[#e11d2a] hover:bg-[#c11825] text-white' 
                    : 'bg-[#e11d2a] hover:bg-[#c11825] text-white'
                }`}>
                  View Collection
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Activity */}
      <section className={`rounded-2xl p-8 ${isDark ? 'bg-[#181818] border border-[#333]' : 'bg-white shadow-lg'}`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {}}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Live Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              isDark ? 'bg-[#222] hover:bg-[#333] border border-[#444]' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-4">
                <img
                  src={activity.image}
                  alt={activity.nft}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.nft}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      activity.type === 'sale' 
                        ? isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-green-100 text-green-800'
                        : activity.type === 'listing' 
                          ? isDark ? 'bg-[#e11d2a]/10 text-[#e11d2a]' : 'bg-blue-100 text-blue-800'
                          : isDark ? 'bg-[#333] text-gray-300' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {activity.type.toUpperCase()}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {activity.type === 'sale' && (
                      <>Sold by <span className="font-mono">{activity.seller}</span> to <span className="font-mono">{activity.buyer}</span></>
                    )}
                    {activity.type === 'listing' && (
                      <>Listed by <span className="font-mono">{activity.seller}</span></>
                    )}
                    {activity.type === 'offer' && (
                      <>Offer from <span className="font-mono">{activity.buyer}</span></>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.price}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/activity"
            className={`inline-flex items-center px-6 py-3 border rounded-lg transition-colors ${
              isDark 
                ? 'border-[#333] text-gray-300 hover:bg-[#222] hover:border-[#e11d2a]' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            View All Activity
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/collections"
            className={`group p-6 rounded-lg border transition-all ${
              isDark 
                ? 'bg-[#181818] border-[#333] hover:border-[#e11d2a] hover:bg-[#222]' 
                : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg'
            }`}
            style={isDark ? {
              boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #0005'
            } : {}}
          >
            <CheckCircleIcon className={`w-8 h-8 mb-4 ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Browse Collections
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover amazing NFT collections on SEI blockchain
            </p>
          </Link>

          <Link
            to="/create"
            className={`group p-6 rounded-lg border transition-all ${
              isDark 
                ? 'bg-[#181818] border-[#333] hover:border-[#e11d2a] hover:bg-[#222]' 
                : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg'
            }`}
            style={isDark ? {
              boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #0005'
            } : {}}
          >
            <CheckCircleIcon className={`w-8 h-8 mb-4 ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create NFT
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Mint your own NFTs with lazy minting support
            </p>
          </Link>

          <Link
            to="/auctions"
            className={`group p-6 rounded-lg border transition-all ${
              isDark 
                ? 'bg-[#181818] border-[#333] hover:border-[#e11d2a] hover:bg-[#222]' 
                : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg'
            }`}
            style={isDark ? {
              boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #0005'
            } : {}}
          >
            <FireIcon className={`w-8 h-8 mb-4 ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Join Auctions
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Bid on exclusive NFTs in live auctions
            </p>
          </Link>
        </div>
      </section>

      {/* Wallet Integration Highlight */}
      <section className={`rounded-2xl p-8 ${
        isDark 
          ? 'bg-gradient-to-r from-[#e11d2a]/10 to-[#181818] border border-[#333]' 
          : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
      }`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {
        boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #e11d2a11'
      }}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            SeismicWallet Integration
          </h2>
          <p className={`mb-6 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Experience seamless NFT trading with native SeismicWallet support. 
            Connect your wallet to start trading with the best user experience on SEI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark ? 'bg-[#222] border border-[#333]' : 'bg-white'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]'}`}></div>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Primary Wallet</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark ? 'bg-[#222] border border-[#333]' : 'bg-white'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-gray-400' : 'bg-orange-500'}`}></div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>MetaMask Fallback</span>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isDark ? 'bg-[#222] border border-[#333]' : 'bg-white'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-900'}`}>Solana Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Network Comparison */}
      <section className={`rounded-2xl p-8 ${isDark ? 'bg-[#181818] border border-[#333]' : 'bg-white shadow-lg border border-gray-200'}`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {
        boxShadow: '0 2px 16px 0 #e11d2a22, 0 2px 12px 0 #e11d2a11'
      }}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Network Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SEI Network */}
          <div className={`border-2 rounded-lg p-6 ${
            isDark 
              ? 'border-[#e11d2a]/30 bg-[#e11d2a]/10' 
              : 'border-red-200 bg-red-50'
          }`} style={isDark ? {
            boxShadow: '0 2px 12px 0 #e11d2a22'
          } : {
            boxShadow: '0 2px 12px 0 #e11d2a22'
          }}>
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]'
              }`}>
                <span className="text-white font-bold text-sm">SEI</span>
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>SEI Network</h3>
                              <span className={`text-xs px-2 py-1 rounded ${
                  isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-200 text-red-800'
                }`}>
                Primary
              </span>
            </div>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• Native SeismicWallet integration</li>
              <li>• Fast transaction speeds</li>
              <li>• Low gas fees</li>
              <li>• Advanced NFT features</li>
              <li>• Cross-chain compatibility</li>
            </ul>
          </div>

          {/* Solana Network */}
          <div className={`border-2 rounded-lg p-6 ${
            isDark 
              ? 'border-[#333] bg-[#222]' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-gray-600' : 'bg-purple-600'
              }`}>
                <span className="text-white font-bold text-sm">SOL</span>
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Solana Network</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                isDark ? 'bg-[#333] text-gray-400' : 'bg-gray-200 text-gray-600'
              }`}>
                Secondary
              </span>
            </div>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>• Optional cross-chain support</li>
              <li>• Phantom wallet integration</li>
              <li>• Auction house features</li>
              <li>• Limited to specific collections</li>
              <li>• Reduced prominence in UI</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}; 