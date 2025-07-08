import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Panel {
  id: string;
  title: string;
  component: React.ComponentType<{ isDark: boolean }>;
  isMinimized: boolean;
  isMaximized: boolean;
}

export const ProDashboard = () => {
  const { isDark } = useTheme();
  const [panels] = useState<Panel[]>([
    { id: 'trading', title: 'Trading View', component: TradingPanel, isMinimized: false, isMaximized: false },
    { id: 'orderbook', title: 'Order Book', component: OrderbookPanel, isMinimized: false, isMaximized: false },
    { id: 'heatmap', title: 'Collection Heatmap', component: HeatmapPanel, isMinimized: false, isMaximized: false },
    { id: 'portfolio', title: 'Portfolio Analytics', component: PortfolioPanel, isMinimized: false, isMaximized: false },
    { id: 'analytics', title: 'Advanced Analytics', component: AnalyticsPanel, isMinimized: false, isMaximized: false },
    { id: 'alerts', title: 'Price Alerts', component: AlertsPanel, isMinimized: false, isMaximized: false }
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`p-6 border-b ${
        isDark 
          ? 'bg-[#0a0a0a] border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Pro Dashboard
            </h1>
            <p className={`mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Advanced trading tools and analytics for professional NFT traders
            </p>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className={`p-6 ${
        isDark 
          ? 'bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#181818]'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className={`rounded-lg shadow-lg ${
                isDark 
                  ? 'bg-[#111] border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className={`p-4 border-b ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <h3 className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {panel.title}
                </h3>
              </div>
              <div className="p-4">
                <panel.component isDark={isDark} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Panel Components
const TradingPanel: React.FC<{ isDark: boolean }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium text-[#e11d2a]">Live Trading View</h4>
        <p className="text-sm text-gray-500 mt-2">Real-time price charts and technical analysis</p>
      </div>
    </div>
  );
};

const OrderbookPanel: React.FC<{ isDark: boolean }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium text-[#e11d2a]">Order Book</h4>
        <p className="text-sm text-gray-500 mt-2">Live buy/sell orders</p>
      </div>
    </div>
  );
};

const HeatmapPanel: React.FC<{ isDark: boolean }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium text-[#e11d2a]">Collection Heatmap</h4>
        <p className="text-sm text-gray-500 mt-2">Visual collection performance</p>
      </div>
    </div>
  );
};

const PortfolioPanel: React.FC<{ isDark: boolean }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium text-[#e11d2a]">Portfolio Analytics</h4>
        <p className="text-sm text-gray-500 mt-2">Portfolio performance metrics</p>
      </div>
    </div>
  );
};

const AnalyticsPanel: React.FC<{ isDark: boolean }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium text-[#e11d2a]">Advanced Analytics</h4>
        <p className="text-sm text-gray-500 mt-2">Deep market insights</p>
      </div>
    </div>
  );
};

const AlertsPanel: React.FC<{ isDark: boolean }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium text-[#e11d2a]">Price Alerts</h4>
        <p className="text-sm text-gray-500 mt-2">Custom price notifications</p>
      </div>
    </div>
  );
}; 