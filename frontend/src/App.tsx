import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo';
import { WalletProvider } from './components/WalletProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';
import { HomePage } from './pages/HomePage';
import { ProDashboard } from './pages/ProDashboard';
import './index.css';

// Placeholder components for other pages
const CollectionsPage = () => {
  const { isDark } = useTheme();
  const collections = [
    {
      id: 1,
      name: 'SEI Samurai',
      description: 'Elite warriors from the SEI blockchain realm',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop',
      banner: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=300&fit=crop',
      floorPrice: '2.5 SEI',
      totalVolume: '1,247 SEI',
      items: '8,888',
      owners: '4,521',
      verified: true
    },
    {
      id: 2,
      name: 'Cosmic Crystals',
      description: 'Mystical crystals with cosmic powers',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop',
      banner: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=300&fit=crop',
      floorPrice: '1.8 SEI',
      totalVolume: '892 SEI',
      items: '5,555',
      owners: '2,834',
      verified: true
    },
    {
      id: 3,
      name: 'Digital Dragons',
      description: 'Legendary dragons in digital form',
      image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=400&fit=crop',
      banner: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&h=300&fit=crop',
      floorPrice: '4.2 SEI',
      totalVolume: '2,347 SEI',
      items: '3,333',
      owners: '1,987',
      verified: false
    },
    {
      id: 4,
      name: 'SEI Legends',
      description: 'Legendary heroes of the SEI ecosystem',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
      floorPrice: '3.1 SEI',
      totalVolume: '1,789 SEI',
      items: '7,777',
      owners: '3,456',
      verified: true
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Collections</h1>
        <p className={`max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Discover and collect unique NFTs from verified creators on the SEI blockchain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {collections.map((collection) => (
          <div key={collection.id} className={`rounded-2xl overflow-hidden transition-all duration-300 group ${
            isDark 
              ? 'bg-[#181818] border border-[#333] hover:border-[#e11d2a]/50' 
              : 'bg-white shadow-lg hover:shadow-xl'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <div className="relative h-32 bg-gradient-to-r from-[#e11d2a] to-red-400">
              <img src={collection.banner} alt={collection.name} className="w-full h-full object-cover opacity-80" />
              {collection.verified && (
                <div className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'bg-[#e11d2a] text-white' : 'bg-[#e11d2a] text-white'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="absolute -bottom-8 left-6">
                <img src={collection.image} alt={collection.name} className="w-16 h-16 rounded-xl border-4 border-white shadow-lg" />
              </div>
            </div>
            
            <div className="pt-12 pb-6 px-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-bold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {collection.name}
                  {collection.verified && (
                    <svg className={`w-5 h-5 ml-2 ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </h3>
              </div>
              
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{collection.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Floor Price</span>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{collection.floorPrice}</div>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Total Volume</span>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{collection.totalVolume}</div>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Items</span>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{collection.items}</div>
                </div>
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Owners</span>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{collection.owners}</div>
                </div>
              </div>
              
              <button className={`w-full mt-6 font-medium py-3 px-4 rounded-lg transition-colors ${
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
    </div>
  );
};

const CreatePage = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create NFT</h1>
        <p className={`max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Create and mint your own NFTs on the SEI blockchain with our advanced lazy minting technology</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload Artwork</h3>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDark 
                ? 'border-[#333] hover:border-[#e11d2a]' 
                : 'border-gray-300 hover:border-red-400'
            }`}>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className={`font-medium cursor-pointer ${
                  isDark ? 'text-[#e11d2a] hover:text-[#c11825]' : 'text-[#e11d2a] hover:text-[#c11825]'
                }`}>Upload a file</span> or drag and drop
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>PNG, JPG, GIF up to 100MB</p>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Preview</h3>
            <div className={`aspect-square rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#222]' : 'bg-gray-100'
            }`}>
              <span className="text-gray-400">No image uploaded</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>NFT Details</h3>
                          <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
                  <input type="text" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-[#222] border-[#333] text-white focus:ring-[#e11d2a] placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-500'
                  }`} placeholder="My Awesome NFT" />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <textarea rows={4} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-[#222] border-[#333] text-white focus:ring-[#e11d2a] placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-500'
                  }`} placeholder="Describe your NFT..."></textarea>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Collection</label>
                  <select className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-[#222] border-[#333] text-white focus:ring-[#e11d2a]' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}>
                    <option>Select Collection (Optional)</option>
                    <option>My First Collection</option>
                    <option>Create New Collection</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
                  <div className="relative">
                    <input type="text" className={`w-full px-3 py-2 pr-12 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      isDark 
                        ? 'bg-[#222] border-[#333] text-white focus:ring-[#e11d2a] placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#e11d2a] placeholder-gray-500'
                    }`} placeholder="0.00" />
                    <span className={`absolute right-3 top-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>SEI</span>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Royalties (%)</label>
                  <input type="text" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-[#222] border-[#333] text-white focus:ring-[#e11d2a] placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-[#e11d2a] placeholder-gray-500'
                  }`} placeholder="5" />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Suggested: 5-10%. Maximum: 20%</p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Minting Options</h3>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-[#e11d2a]/10 border border-[#e11d2a]/30' : 'bg-red-50 border border-red-200'
              }`}>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Lazy Minting</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Mint for free, pay gas only when sold</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className={`h-4 w-4 rounded border focus:ring-2 ${
                    isDark 
                      ? 'text-[#e11d2a] focus:ring-[#e11d2a] border-[#333] bg-[#222]' 
                      : 'text-[#e11d2a] focus:ring-[#e11d2a] border-gray-300 bg-white'
                  }`} />
                </div>
              </div>
              
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                isDark ? 'bg-[#222] border border-[#333]' : 'bg-gray-50'
              }`}>
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Unlockable Content</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Add special content for the owner</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className={`h-4 w-4 rounded border focus:ring-2 ${
                    isDark 
                      ? 'text-[#e11d2a] focus:ring-[#e11d2a] border-[#333] bg-[#222]' 
                      : 'text-[#e11d2a] focus:ring-[#e11d2a] border-gray-300 bg-white'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          <button className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
            isDark 
              ? 'bg-[#e11d2a] hover:bg-[#c11825] text-white' 
              : 'bg-[#e11d2a] hover:bg-[#c11825] text-white'
          }`}>
            Create NFT
          </button>
        </div>
      </div>
    </div>
  );
};

const AuctionsPage = () => {
  const { isDark } = useTheme();
  const auctions = [
    {
      id: 1,
      name: 'Golden SEI Samurai #1',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop',
      currentBid: '12.5 SEI',
      minBid: '13.0 SEI',
      timeLeft: '2h 34m 12s',
      bidders: 23,
      collection: 'SEI Samurai',
      seller: '0xa1b2...c3d4',
      featured: true
    },
    {
      id: 2,
      name: 'Mystic Crystal #777',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop',
      currentBid: '8.9 SEI',
      minBid: '9.5 SEI',
      timeLeft: '5h 18m 45s',
      bidders: 17,
      collection: 'Cosmic Crystals',
      seller: '0xe5f6...g7h8',
      featured: false
    },
    {
      id: 3,
      name: 'Legendary Dragon King',
      image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=400&fit=crop',
      currentBid: '25.0 SEI',
      minBid: '27.0 SEI',
      timeLeft: '1d 12h 7m',
      bidders: 45,
      collection: 'Digital Dragons',
      seller: '0xi9j0...k1l2',
      featured: true
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Auctions</h1>
        <p className={`max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Bid on exclusive NFTs in real-time auctions on the SEI blockchain</p>
      </div>

      <div className={`rounded-2xl p-6 text-white ${
        isDark 
          ? 'bg-gradient-to-r from-[#e11d2a] to-[#111]' 
          : 'bg-gradient-to-r from-[#e11d2a] to-red-500'
      }`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {
        boxShadow: '0 2px 16px 0 #e11d2a33, 0 2px 12px 0 #e11d2a22'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔥 Hot Auctions</h2>
            <p className={isDark ? 'text-gray-200' : 'text-red-100'}>Don't miss these ending soon!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">23</div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-red-200'}`}>Active Auctions</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <div key={auction.id} className={`rounded-2xl overflow-hidden transition-all duration-300 ${
            isDark 
              ? `bg-[#181818] border border-[#333] hover:border-[#e11d2a]/50 ${auction.featured ? 'ring-2 ring-[#e11d2a]' : ''}` 
              : `bg-white shadow-lg hover:shadow-xl ${auction.featured ? 'ring-2 ring-[#e11d2a]' : ''}`
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            {auction.featured && (
              <div className={`text-white text-center py-2 text-sm font-medium ${
                isDark 
                  ? 'bg-gradient-to-r from-[#e11d2a] to-[#111]' 
                  : 'bg-gradient-to-r from-[#e11d2a] to-red-500'
              }`}>
                🔥 Featured Auction
              </div>
            )}
            
            <div className="relative">
              <img src={auction.image} alt={auction.name} className="w-full h-64 object-cover" />
              <div className={`absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-medium ${
                isDark ? 'bg-[#e11d2a]' : 'bg-red-600'
              }`}>
                LIVE
              </div>
              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {auction.timeLeft}
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-3">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{auction.name}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{auction.collection}</p>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current Bid</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{auction.currentBid}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Minimum Bid</span>
                  <span className={`font-semibold ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>{auction.minBid}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Bidders</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{auction.bidders}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder={auction.minBid}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-colors ${
                      isDark 
                        ? 'bg-[#222] border-[#333] text-white focus:ring-[#e11d2a] placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-[#e11d2a] placeholder-gray-500'
                    }`}
                  />
                  <span className={`flex items-center px-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>SEI</span>
                </div>
                
                <button className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-[#e11d2a] to-[#c11825] hover:from-[#c11825] hover:to-[#a01622] text-white' 
                    : 'bg-gradient-to-r from-[#e11d2a] to-[#c11825] hover:from-[#c11825] hover:to-[#a01622] text-white'
                }`}>
                  Place Bid
                </button>
              </div>
              
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-[#333]' : 'border-gray-200'}`}>
                <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Seller: {auction.seller}</span>
                  <span>⏰ {auction.timeLeft}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-8 ${
        isDark 
          ? 'bg-[#181818] border border-[#333]' 
          : 'bg-white shadow-lg'
      }`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {}}>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>How Auctions Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
            }`}>
              <span className={`font-bold ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>1</span>
            </div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Place Your Bid</h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Enter an amount higher than the current bid</p>
          </div>
          
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
            }`}>
              <span className={`font-bold ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>2</span>
            </div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Wait for Results</h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Monitor the auction until it ends</p>
          </div>
          
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isDark ? 'bg-[#e11d2a]/20' : 'bg-red-100'
            }`}>
              <span className={`font-bold ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>3</span>
            </div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Win & Collect</h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Highest bidder wins the NFT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { isDark } = useTheme();
  const userStats = {
    totalValue: '127.8 SEI',
    nftsOwned: 47,
    collections: 12,
    sales: 23,
    purchases: 31
  };

  const ownedNFTs = [
    {
      id: 1,
      name: 'SEI Samurai #3847',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=300&fit=crop',
      collection: 'SEI Samurai',
      price: '3.2 SEI',
      listed: true
    },
    {
      id: 2,
      name: 'Cosmic Crystal #291',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=300&h=300&fit=crop',
      collection: 'Cosmic Crystals',
      price: '2.1 SEI',
      listed: false
    },
    {
      id: 3,
      name: 'Digital Dragon #1504',
      image: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&h=300&fit=crop',
      collection: 'Digital Dragons',
      price: '5.7 SEI',
      listed: true
    },
    {
      id: 4,
      name: 'SEI Legend #2891',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      collection: 'SEI Legends',
      price: '4.1 SEI',
      listed: false
    }
  ];

  const recentActivity = [
    { type: 'purchase', nft: 'SEI Samurai #3847', price: '3.0 SEI', date: '2 days ago', from: '0xab12...cd34' },
    { type: 'sale', nft: 'Cosmic Crystal #156', price: '2.8 SEI', date: '5 days ago', to: '0xef56...gh78' },
    { type: 'listing', nft: 'Digital Dragon #1504', price: '5.7 SEI', date: '1 week ago', action: 'Listed for sale' },
    { type: 'purchase', nft: 'SEI Legend #2891', price: '3.9 SEI', date: '2 weeks ago', from: '0xij90...kl12' }
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className={`rounded-2xl p-8 text-white ${
        isDark 
          ? 'bg-gradient-to-r from-[#e11d2a] to-[#111]' 
          : 'bg-gradient-to-r from-[#e11d2a] to-red-500'
      }`} style={isDark ? {
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {
        boxShadow: '0 2px 16px 0 #e11d2a33, 0 2px 12px 0 #e11d2a22'
      }}>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">CryptoCollector.sei</h1>
            <p className={`mb-2 ${isDark ? 'text-gray-200' : 'text-red-100'}`}>Wallet: 0x1a2b3c4d...5e6f7g8h</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">✅ Verified Creator</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">🔥 Active Trader</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`rounded-xl p-6 text-center ${
          isDark 
            ? 'bg-[#181818] border border-[#333]' 
            : 'bg-white shadow-lg'
        }`} style={isDark ? {
          boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
        } : {}}>
          <div className={`text-2xl font-bold ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>{userStats.totalValue}</div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Portfolio Value</div>
        </div>
        <div className={`rounded-xl p-6 text-center ${
          isDark 
            ? 'bg-[#181818] border border-[#333]' 
            : 'bg-white shadow-lg'
        }`} style={isDark ? {
          boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
        } : {}}>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{userStats.nftsOwned}</div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>NFTs Owned</div>
        </div>
        <div className={`rounded-xl p-6 text-center ${
          isDark 
            ? 'bg-[#181818] border border-[#333]' 
            : 'bg-white shadow-lg'
        }`} style={isDark ? {
          boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
        } : {}}>
          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{userStats.collections}</div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Collections</div>
        </div>
        <div className={`rounded-xl p-6 text-center ${
          isDark 
            ? 'bg-[#181818] border border-[#333]' 
            : 'bg-white shadow-lg'
        }`} style={isDark ? {
          boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
        } : {}}>
          <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{userStats.sales}</div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Sales</div>
        </div>
        <div className={`rounded-xl p-6 text-center ${
          isDark 
            ? 'bg-[#181818] border border-[#333]' 
            : 'bg-white shadow-lg'
        }`} style={isDark ? {
          boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
        } : {}}>
          <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{userStats.purchases}</div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Purchases</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* NFT Collection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My NFTs</h2>
            <div className="flex space-x-2">
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-[#e11d2a] text-white hover:bg-[#c11825]' 
                  : 'bg-[#e11d2a] text-white hover:bg-[#c11825]'
              }`}>All</button>
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-[#333] text-gray-300 hover:bg-[#444]' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>Listed</button>
              <button className={`px-4 py-2 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-[#333] text-gray-300 hover:bg-[#444]' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>Unlisted</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ownedNFTs.map((nft) => (
              <div key={nft.id} className={`rounded-xl overflow-hidden transition-all duration-300 group ${
                isDark 
                  ? 'bg-[#181818] border border-[#333] hover:border-[#e11d2a]/50' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`} style={isDark ? {
                boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
              } : {}}>
                <div className="relative">
                  <img src={nft.image} alt={nft.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                  {nft.listed && (
                    <div className={`absolute top-2 right-2 text-white px-2 py-1 rounded text-xs font-medium ${
                      isDark ? 'bg-green-500' : 'bg-green-600'
                    }`}>
                      LISTED
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{nft.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{nft.collection}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{nft.price}</span>
                    <button className={`text-sm font-medium ${
                      isDark 
                        ? 'text-[#e11d2a] hover:text-[#c11825]' 
                        : 'text-[#e11d2a] hover:text-[#c11825]'
                    }`}>
                      {nft.listed ? 'Edit' : 'List'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity & Settings */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  isDark ? 'bg-[#222] border border-[#333]' : 'bg-gray-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    activity.type === 'purchase' ? (isDark ? 'bg-green-500' : 'bg-green-500') : 
                    activity.type === 'sale' ? (isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]') : (isDark ? 'bg-orange-500' : 'bg-orange-500')
                  }`}>
                    {activity.type === 'purchase' ? '↓' : activity.type === 'sale' ? '↑' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.nft}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {activity.type === 'purchase' && `Bought from ${activity.from}`}
                      {activity.type === 'sale' && `Sold to ${activity.to}`}
                      {activity.type === 'listing' && activity.action}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.price}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <div className="space-y-3">
              <button className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-[#e11d2a] hover:bg-[#c11825] text-white' 
                  : 'bg-[#e11d2a] hover:bg-[#c11825] text-white'
              }`}>
                Create New NFT
              </button>
              <button className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-[#333] hover:bg-[#444] text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}>
                Edit Profile
              </button>
              <button className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                isDark 
                  ? 'bg-[#333] hover:bg-[#444] text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}>
                Export Collection
              </button>
            </div>
          </div>

          {/* Theme Settings */}
          <div className={`${isDark ? 'bg-[#181818]' : 'bg-white'} rounded-2xl p-6 ${isDark ? '' : 'shadow-lg'}`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme Settings</h3>
            <ThemeToggle />
          </div>

          {/* Wallet Info */}
          <div className={`rounded-2xl p-6 ${
            isDark 
              ? 'bg-[#181818] border border-[#333]' 
              : 'bg-white shadow-lg'
          }`} style={isDark ? {
            boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
          } : {}}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Wallet</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Balance</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>24.7 SEI</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Network</span>
                <span className={`font-semibold ${isDark ? 'text-[#e11d2a]' : 'text-[#e11d2a]'}`}>SEI Mainnet</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Wallet Type</span>
                <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>SeismicWallet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <WalletProvider>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/auctions" element={<AuctionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/pro" element={<ProDashboard />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </WalletProvider>
    </ApolloProvider>
  );
}

export default App; 