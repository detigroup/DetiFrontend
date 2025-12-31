
import React from 'react';
import { AppView } from '../types';
import { LayoutGrid, TrendingUp, Wallet, Settings, LogOut, ChevronLeft, ChevronRight, RefreshCw, Percent, Crown, ShieldCheck, BarChart2 } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ currentView, setView, isCollapsed, toggleCollapse, isLoggedIn, onLogout }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutGrid, requireAuth: true },
    { id: AppView.MARKETS, label: 'Markets', icon: BarChart2 },
    { id: AppView.TRADING, label: 'Exchange', icon: TrendingUp },
    { id: AppView.SWAP, label: 'Quick Swap', icon: RefreshCw },
    { id: AppView.WALLET, label: 'Wallet', icon: Wallet, requireAuth: true },
    { id: AppView.FEES, label: 'Fees & VIP', icon: Percent },
    { id: AppView.KYC, label: 'Verification', icon: ShieldCheck, requireAuth: true },
    { id: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`hidden lg:flex fixed left-0 top-0 h-full bg-deti-sidebar/70 backdrop-blur-xl border-r border-white/5 flex-col justify-between z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo removed for cleaner top bar */}

        {/* Menu */}
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => {
             return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                } ${
                  currentView === item.id 
                    ? 'bg-gradient-brand text-white shadow-glow' 
                    : 'text-deti-subtext hover:bg-white/5 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${currentView === item.id ? 'text-white' : 'text-deti-subtext group-hover:text-deti-primary'}`} />
                <span className={`font-medium ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'hidden w-0' : 'block'}`}>
                  {item.label}
                </span>
                {currentView === item.id && !isCollapsed && (
                  <div className="block ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br from-deti-card/80 to-deti-bg/50 border border-white/10 flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
           <div className="w-8 h-8 rounded-full bg-deti-primary/10 flex items-center justify-center text-deti-primary border border-deti-primary/20">
              <Crown size={16} />
           </div>
           <div className="overflow-hidden">
              <div className="text-xs text-deti-subtext">Current Plan</div>
              <div className="text-sm font-bold text-white truncate">VIP Level 1</div>
           </div>
        </div>

        {/* Toggle Button */}
        <button 
           onClick={toggleCollapse}
           className="flex w-full items-center justify-center p-2 rounded-lg text-deti-subtext hover:bg-white/5 hover:text-white transition-colors"
        >
           {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {isLoggedIn && (
          <button 
            onClick={onLogout}
            className={`w-full flex items-center px-3 py-3 rounded-xl text-deti-subtext hover:bg-white/5 hover:text-deti-danger transition-colors ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`font-medium ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'hidden w-0' : 'block'}`}>
              Logout
            </span>
          </button>
        )}
      </div>
    </aside>
  );
});
