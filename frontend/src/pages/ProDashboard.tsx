import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Users, 
  Shield, 
  Zap,
  Settings,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Panel {
  id: string;
  title: string;
  type: 'orderbook' | 'heatmap' | 'portfolio' | 'analytics' | 'alerts' | 'console';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
}

interface ProDashboardProps {
  className?: string;
}

export const ProDashboard: React.FC<ProDashboardProps> = ({ className = '' }) => {
  const { isDark } = useTheme();
  const [panels, setPanels] = useState<Panel[]>([
    {
      id: 'orderbook',
      title: 'Live Orderbook',
      type: 'orderbook',
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      isMinimized: false,
      isMaximized: false,
    },
    {
      id: 'heatmap',
      title: 'Transaction Heatmap',
      type: 'heatmap',
      position: { x: 420, y: 0 },
      size: { width: 400, height: 300 },
      isMinimized: false,
      isMaximized: false,
    },
    {
      id: 'portfolio',
      title: 'Portfolio Overview',
      type: 'portfolio',
      position: { x: 0, y: 320 },
      size: { width: 400, height: 250 },
      isMinimized: false,
      isMaximized: false,
    },
    {
      id: 'analytics',
      title: 'Market Analytics',
      type: 'analytics',
      position: { x: 420, y: 320 },
      size: { width: 400, height: 250 },
      isMinimized: false,
      isMaximized: false,
    },
    {
      id: 'alerts',
      title: 'Fraud Radar Alerts',
      type: 'alerts',
      position: { x: 840, y: 0 },
      size: { width: 300, height: 200 },
      isMinimized: false,
      isMaximized: false,
    },
    {
      id: 'console',
      title: 'Transaction Console',
      type: 'console',
      position: { x: 840, y: 220 },
      size: { width: 300, height: 350 },
      isMinimized: false,
      isMaximized: false,
    },
  ]);

  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handlePanelDrag = (panelId: string, info: any) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId 
        ? { ...panel, position: { x: info.point.x, y: info.point.y } }
        : panel
    ));
  };

  const togglePanelMinimize = (panelId: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId 
        ? { ...panel, isMinimized: !panel.isMinimized, isMaximized: false }
        : panel
    ));
  };

  const togglePanelMaximize = (panelId: string) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId 
        ? { ...panel, isMaximized: !panel.isMaximized, isMinimized: false }
        : panel
    ));
  };

  const closePanel = (panelId: string) => {
    setPanels(prev => prev.filter(panel => panel.id !== panelId));
  };

  const renderPanelContent = (panel: Panel) => {
    switch (panel.type) {
      case 'orderbook':
        return <OrderbookPanel isDark={isDark} />;
      case 'heatmap':
        return <HeatmapPanel isDark={isDark} />;
      case 'portfolio':
        return <PortfolioPanel isDark={isDark} />;
      case 'analytics':
        return <AnalyticsPanel isDark={isDark} />;
      case 'alerts':
        return <AlertsPanel isDark={isDark} />;
      case 'console':
        return <ConsolePanel isDark={isDark} />;
      default:
        return <div>Unknown panel type</div>;
    }
  };

  return (
    <div className={`pro-dashboard ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 text-white ${
        isDark 
          ? 'bg-gradient-to-r from-[#111] via-[#181818] to-[#111]'
          : 'bg-gradient-to-r from-blue-600 to-purple-800'
      }`} style={isDark ? {
        borderBottom: '1px solid #333',
        boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
      } : {}}>
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-display font-bold">Epicenter Pro</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Trading</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
            isDark 
              ? 'bg-[#e11d2a] hover:bg-[#c11825] text-white' 
              : 'bg-blue-700 hover:bg-blue-600 text-white'
          }`}>
            <Zap className="w-4 h-4" />
            <span>Floor Flip</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
            isDark 
              ? 'bg-[#333] hover:bg-[#444] text-gray-300' 
              : 'bg-purple-700 hover:bg-purple-600 text-white'
          }`}>
            <Shield className="w-4 h-4" />
            <span>Fraud Radar</span>
          </button>
          <button className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
            isDark 
              ? 'bg-[#333] hover:bg-[#444] text-gray-300' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}>
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className={`relative w-full h-screen overflow-hidden ${
        isDark 
          ? 'bg-[#0a0a0a]' 
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
      }`}>
        <AnimatePresence>
          {panels.map((panel) => (
            <motion.div
              key={panel.id}
              drag={!panel.isMinimized && !panel.isMaximized}
              dragMomentum={false}
              dragElastic={0.1}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onDrag={(e, info) => handlePanelDrag(panel.id, info)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: panel.isMaximized ? 0 : panel.position.x,
                y: panel.isMaximized ? 0 : panel.position.y,
                width: panel.isMaximized ? '100%' : panel.size.width,
                height: panel.isMaximized ? '100%' : (panel.isMinimized ? 40 : panel.size.height),
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute rounded-lg shadow-2xl ${
                isDark 
                  ? 'bg-[#181818] border border-[#333]' 
                  : 'bg-gray-800 border border-gray-700'
              } ${panel.isMaximized ? 'z-50' : 'z-10'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                width: panel.isMaximized ? '100%' : panel.size.width,
                height: panel.isMaximized ? '100%' : (panel.isMinimized ? 40 : panel.size.height),
                ...(isDark ? {
                  boxShadow: '0 2px 16px 0 #e11d2a44, 0 2px 12px 0 #000a'
                } : {})
              }}
            >
              {/* Panel Header */}
              <div className={`flex items-center justify-between p-3 rounded-t-lg border-b ${
                isDark 
                  ? 'bg-gradient-to-r from-[#222] to-[#181818] border-[#333]' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#e11d2a]' : 'bg-blue-400'}`}></div>
                  <h3 className="text-sm font-semibold text-white">{panel.title}</h3>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => togglePanelMinimize(panel.id)}
                    className={`p-1 rounded transition-colors ${
                      isDark ? 'hover:bg-[#333]' : 'hover:bg-gray-600'
                    }`}
                  >
                    <Minimize2 className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={() => togglePanelMaximize(panel.id)}
                    className={`p-1 rounded transition-colors ${
                      isDark ? 'hover:bg-[#333]' : 'hover:bg-gray-600'
                    }`}
                  >
                    <Maximize2 className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={() => closePanel(panel.id)}
                    className={`p-1 rounded transition-colors ${
                      isDark ? 'hover:bg-[#e11d2a]' : 'hover:bg-red-600'
                    }`}
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              {!panel.isMinimized && (
                <div className="p-4 h-full overflow-hidden">
                  {renderPanelContent(panel)}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Panel Components
const OrderbookPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [orderbookData] = useState([
    { price: 2.5, amount: 10, type: 'bid' },
    { price: 2.4, amount: 15, type: 'bid' },
    { price: 2.3, amount: 8, type: 'bid' },
    { price: 2.6, amount: 12, type: 'ask' },
    { price: 2.7, amount: 20, type: 'ask' },
    { price: 2.8, amount: 5, type: 'ask' },
  ]);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold">Live Orderbook</h4>
        <div className="text-xs text-gray-400">Updated 2s ago</div>
      </div>
      
      <div className="space-y-1">
        {orderbookData.map((order, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-2 rounded ${
              order.type === 'bid' 
                ? 'bg-green-900/20 border border-green-500/30' 
                : 'bg-red-900/20 border border-red-500/30'
            }`}
          >
            <span className={`text-sm ${
              order.type === 'bid' ? 'text-green-400' : 'text-red-400'
            }`}>
              {order.price} SEI
            </span>
            <span className="text-sm text-gray-300">{order.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeatmapPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold">Transaction Heatmap</h4>
        <div className="text-xs text-gray-400">Last 24h</div>
      </div>
      
      <div className="grid grid-cols-24 grid-rows-7 gap-1 h-48">
        {Array.from({ length: 168 }, (_, i) => (
          <div
            key={i}
            className="bg-epicenter-600/20 border border-epicenter-500/30 rounded"
            style={{
              backgroundColor: `rgba(14, 165, 233, ${Math.random() * 0.8 + 0.1})`,
            }}
          />
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

const PortfolioPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [portfolio] = useState({
    totalValue: 1250.50,
    change24h: 12.5,
    nfts: [
      { name: 'Epicenter #1234', value: 450.00, change: 5.2 },
      { name: 'Crypto Punk #5678', value: 800.50, change: -2.1 },
    ]
  });

  return (
    <div className="h-full">
      <div className="mb-4">
        <div className="text-2xl font-bold text-white">${portfolio.totalValue.toLocaleString()}</div>
        <div className={`text-sm ${portfolio.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {portfolio.change24h >= 0 ? '+' : ''}{portfolio.change24h}% (24h)
        </div>
      </div>
      
      <div className="space-y-3">
        {portfolio.nfts.map((nft, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
            <div>
              <div className="text-sm text-white">{nft.name}</div>
              <div className="text-xs text-gray-400">${nft.value}</div>
            </div>
            <div className={`text-sm ${nft.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {nft.change >= 0 ? '+' : ''}{nft.change}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold">Market Analytics</h4>
        <div className="text-xs text-gray-400">Real-time</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-xs text-gray-400">Volume 24h</div>
          <div className="text-lg font-bold text-white">$2.4M</div>
          <div className="text-xs text-green-400">+15.2%</div>
        </div>
        
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-xs text-gray-400">Floor Price</div>
          <div className="text-lg font-bold text-white">2.5 SEI</div>
          <div className="text-xs text-red-400">-2.1%</div>
        </div>
        
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-xs text-gray-400">Active Traders</div>
          <div className="text-lg font-bold text-white">1,234</div>
          <div className="text-xs text-green-400">+8.5%</div>
        </div>
        
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-xs text-gray-400">Whale Activity</div>
          <div className="text-lg font-bold text-white">High</div>
          <div className="text-xs text-yellow-400">+12.3%</div>
        </div>
      </div>
    </div>
  );
};

const AlertsPanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [alerts] = useState([
    { id: 1, type: 'fraud', message: 'Suspicious activity detected', time: '2m ago' },
    { id: 2, type: 'whale', message: 'Large transaction detected', time: '5m ago' },
    { id: 3, type: 'price', message: 'Floor price dropped 10%', time: '8m ago' },
  ]);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold">Fraud Radar Alerts</h4>
        <div className="text-xs text-red-400">3 Active</div>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-2 bg-red-900/20 border border-red-500/30 rounded">
            <div className="flex justify-between items-start">
              <div className="text-sm text-white">{alert.message}</div>
              <div className="text-xs text-gray-400">{alert.time}</div>
            </div>
            <div className="text-xs text-red-400 mt-1">
              {alert.type === 'fraud' && '🚨 Fraud Alert'}
              {alert.type === 'whale' && '🐋 Whale Activity'}
              {alert.type === 'price' && '📉 Price Alert'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConsolePanel: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [transactions] = useState([
    { id: 1, type: 'buy', amount: '2.5 SEI', time: '12:34:56' },
    { id: 2, type: 'sell', amount: '1.8 SEI', time: '12:33:42' },
    { id: 3, type: 'floor_flip', amount: '3.2 SEI', time: '12:32:18' },
    { id: 4, type: 'bridge', amount: '5.0 SEI', time: '12:31:05' },
  ]);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold">Transaction Console</h4>
        <div className="text-xs text-gray-400">Live Feed</div>
      </div>
      
      <div className="space-y-2 h-64 overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                tx.type === 'buy' ? 'bg-green-400' :
                tx.type === 'sell' ? 'bg-red-400' :
                tx.type === 'floor_flip' ? 'bg-blue-400' :
                'bg-purple-400'
              }`} />
              <span className="text-sm text-white">{tx.type.toUpperCase()}</span>
            </div>
            <div className="text-sm text-gray-300">{tx.amount}</div>
            <div className="text-xs text-gray-400">{tx.time}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-2 bg-gray-700/50 rounded">
        <div className="text-xs text-gray-400 mb-1">Quick Actions</div>
        <div className="flex space-x-2">
          <button className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
            Floor Flip
          </button>
          <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            Bridge
          </button>
          <button className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700">
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard; 