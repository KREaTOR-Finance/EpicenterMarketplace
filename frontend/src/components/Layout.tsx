import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from './WalletProvider';
import { useTheme } from '../contexts/ThemeContext';
import { 
  HomeIcon, 
  CollectionIcon, 
  PlusIcon, 
  UserIcon, 
  CogIcon,
  FireIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Collections', href: '/collections', icon: CollectionIcon },
    { name: 'Create', href: '/create', icon: PlusIcon },
    { name: 'Auctions', href: '/auctions', icon: FireIcon, secondary: true },
    { name: 'Pro Dashboard', href: '/pro', icon: CurrencyDollarIcon, pro: true },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-[#111] border-b border-[#333] shadow-lg' : 'bg-white shadow-sm border-b border-gray-200'}`} style={isDark ? {
        background: 'linear-gradient(90deg, #111 80%, #181818 100%)',
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]'}`}>
                  <span className="text-white font-bold text-sm">SE</span>
                </div>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Seismic Epicenter</span>
              </Link>
            </div>

            {/* Primary Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-100 text-red-700'
                      : isDark ? 'text-gray-300 hover:text-white hover:bg-[#181818]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${item.secondary ? 'opacity-75' : ''} ${item.pro ? isDark ? 'bg-[#e11d2a]/10 text-[#e11d2a]' : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700' : ''}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.secondary && (
                    <span className={`text-xs px-1 py-0.5 rounded ${isDark ? 'bg-[#181818] text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      SEI
                    </span>
                  )}
                  {item.pro && (
                    <span className={`text-xs px-1 py-0.5 rounded ${isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-200 text-red-700'}`}>
                      PRO
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              {/* SEI Network Indicator */}
              <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-100 text-red-800'}`}>
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]'}`}></div>
                <span>SEI Network</span>
              </div>

              {/* Wallet Connect */}
              <WalletConnect />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-100 text-red-700'
                    : isDark ? 'text-gray-300 hover:text-white hover:bg-[#181818]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${item.secondary ? 'opacity-75' : ''} ${item.pro ? isDark ? 'bg-[#e11d2a]/10 text-[#e11d2a]' : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.secondary && (
                  <span className={`text-xs px-1 py-0.5 rounded ${isDark ? 'bg-[#181818] text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    SEI
                  </span>
                )}
                                  {item.pro && (
                    <span className={`text-xs px-1 py-0.5 rounded ${isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-red-200 text-red-700'}`}>
                      PRO
                    </span>
                  )}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-[#111] border-t border-[#333]' : 'bg-white border-t border-gray-200'} mt-auto`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#e11d2a]' : 'bg-[#e11d2a]'}`}>
                  <span className="text-white font-bold text-sm">SE</span>
                </div>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Seismic Epicenter</span>
              </div>
              <p className={`max-w-md ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                The premier cross-chain NFT marketplace built for the SEI ecosystem. 
                Trade NFTs with confidence using SeismicWallet.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={`text-sm font-semibold tracking-wider uppercase mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Marketplace
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/collections" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Browse Collections
                  </Link>
                </li>
                <li>
                  <Link to="/create" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Create NFT
                  </Link>
                </li>
                <li>
                  <Link to="/auctions" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Auctions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className={`text-sm font-semibold tracking-wider uppercase mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className={`${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className={`mt-8 pt-6 ${isDark ? 'border-t border-[#333]' : 'border-t border-gray-200'}`}>
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#" className={`transition-colors ${isDark ? 'text-gray-500 hover:text-[#e11d2a]' : 'text-gray-400 hover:text-[#e11d2a]'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className={`transition-colors ${isDark ? 'text-gray-500 hover:text-[#e11d2a]' : 'text-gray-400 hover:text-[#e11d2a]'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" className={`transition-colors ${isDark ? 'text-gray-500 hover:text-[#e11d2a]' : 'text-gray-400 hover:text-[#e11d2a]'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.341-.09.381-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" className={`transition-colors ${isDark ? 'text-gray-500 hover:text-[#e11d2a]' : 'text-gray-400 hover:text-[#e11d2a]'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className={`transition-colors ${isDark ? 'text-gray-500 hover:text-[#e11d2a]' : 'text-gray-400 hover:text-[#e11d2a]'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.0960V13.0956Z"/>
                </svg>
              </a>
              <a href="#" className={`transition-colors ${isDark ? 'text-gray-500 hover:text-[#e11d2a]' : 'text-gray-400 hover:text-[#e11d2a]'}`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295 1.688c3.825-2.677 6.25-7.094 6.25-12.013 0-2.444-.637-4.737-1.756-6.756l-3.744 2.581z"/>
                  <path d="M12.556 14.711v4.372c0 .404-.324.73-.724.73s-.724-.326-.724-.73v-4.372c0-.404.324-.73.724-.73s.724.326.724.73z"/>
                  <path d="M9.804 3.557c0-.98.8-1.78 1.78-1.78.98 0 1.78.8 1.78 1.78s-.8 1.78-1.78 1.78c-.98 0-1.78-.8-1.78-1.78z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-6 ${isDark ? 'border-t border-[#333]' : 'border-t border-gray-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                © 2025 Seismic Epicenter. All rights reserved. Powered by Kreation Studios.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Built for SEI Network
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Primary:</span>
                  <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-[#e11d2a]/20 text-[#e11d2a]' : 'bg-blue-100 text-blue-800'}`}>
                    SeismicWallet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}; 