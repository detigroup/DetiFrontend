
import React, { useState } from 'react';
import { AppView } from '../types';
import { LayoutGrid, TrendingUp, Wallet, Settings, LogOut, ChevronLeft, ChevronRight, RefreshCw, Percent, Crown, ShieldCheck, BarChart2, List } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ currentView, setView, isCollapsed, toggleCollapse, isLoggedIn, onLogout }) => {
  const [isHovering, setIsHovering] = useState(false);

  const isOpen = !isCollapsed || isHovering; // expand on hover when not pinned

  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutGrid, requireAuth: true },
    { id: AppView.MARKETS, label: 'Markets', icon: BarChart2 },
    { id: AppView.TRADING, label: 'Trade', icon: TrendingUp },
    { id: AppView.WALLET, label: 'Assets', icon: Wallet, requireAuth: true },
    { id: AppView.ORDERS, label: 'Orders', icon: List, requireAuth: true },
    { id: AppView.KYC, label: 'Security', icon: ShieldCheck, requireAuth: true },
    { id: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`hidden lg:flex fixed left-0 top-0 h-full bg-deti-sidebar/70 backdrop-blur-xl border-r border-white/5 flex-col justify-between z-50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => isCollapsed && setIsHovering(true)}
      onMouseLeave={() => isCollapsed && setIsHovering(false)}
    >
      <div>
        {/* Menu */}
        <nav className="mt-8 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isOpen ? 'justify-start' : 'justify-center'
                } ${
                  isActive 
                    ? 'bg-white/10 text-white border border-deti-primary/40 shadow-glow' 
                    : 'text-deti-subtext hover:bg-white/5 hover:text-white border border-transparent'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-deti-subtext group-hover:text-deti-primary'}`} />
                <span className={`font-semibold ml-3 whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  {item.label}
                </span>
                {isActive && isOpen && (
                  <span className="ml-auto w-1.5 h-8 rounded-full bg-deti-primary shadow-[0_0_10px_rgba(255,199,87,0.8)]"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2">
        <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br from-deti-card/80 to-deti-bg/50 border border-white/10 items-center gap-3 ${isOpen ? 'flex' : 'hidden'}`}>
           <div className="w-8 h-8 rounded-full bg-deti-primary/10 flex items-center justify-center text-deti-primary border border-deti-primary/20">
              <Crown size={16} />
           </div>
           <div className="overflow-hidden">
              <div className="text-xs text-deti-subtext">Current Plan</div>
              <div className="text-sm font-bold text-white truncate">VIP Level 1</div>
           </div>
        </div>

        {/* Pin / Unpin */}
        <button 
           onClick={toggleCollapse}
           className={`flex w-full items-center ${isOpen ? 'justify-between px-3' : 'justify-center'} py-2 rounded-lg text-deti-subtext hover:bg-white/5 hover:text-white transition-colors`}
        >
           <span className={`${isOpen ? 'block text-xs font-semibold' : 'hidden'}`}>{isCollapsed ? 'Pin Sidebar' : 'Unpin Sidebar'}</span>
           {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {isLoggedIn && (
          <button 
            onClick={onLogout}
            className={`w-full flex items-center px-3 py-3 rounded-xl text-deti-subtext hover:bg-white/5 hover:text-deti-danger transition-colors ${
              isOpen ? 'justify-start' : 'justify-center'
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`font-medium ml-4 whitespace-nowrap overflow-hidden transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Logout
            </span>
          </button>
        )}
      </div>
    </aside>
  );
});
