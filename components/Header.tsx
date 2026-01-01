
import React, { useEffect, useState } from 'react';
import { AppView } from '../types';
import { Wallet, Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const [language, setLanguage] = useState<'en' | 'vi' | 'ar'>(() => {
    try {
      return (localStorage.getItem('deti_lang') as any) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('deti_lang', language);
    } catch {
      /* no-op */
    }
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    window.dispatchEvent(new CustomEvent('deti-lang-change', { detail: language }));
  }, [language]);

  return (
    <header className="h-16 border-b border-deti-border bg-deti-bg/95 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-8">
        {/* Logo - Reduced size further */}
        <div 
          className="flex items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setView(AppView.LANDING)}
        >
             <img 
               src="https://i.postimg.cc/3Rj9YpjK/Group-83.png" 
               alt="DETI HOLD" 
               className="h-8 w-auto object-contain"
             />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => setView(AppView.TRADING)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.TRADING ? 'text-deti-text bg-deti-surface' : 'text-deti-subtext hover:text-deti-text hover:bg-deti-surface'}`}
          >
            Exchange
          </button>
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.DASHBOARD ? 'text-deti-text bg-deti-surface' : 'text-deti-subtext hover:text-deti-text hover:bg-deti-surface'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView(AppView.WALLET)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === AppView.WALLET ? 'text-deti-text bg-deti-surface' : 'text-deti-subtext hover:text-deti-text hover:bg-deti-surface'}`}
          >
            Wallet
          </button>
          <button className="px-4 py-2 rounded-md text-sm font-medium text-deti-subtext hover:text-deti-text hover:bg-deti-surface transition-all">
            Earn
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden lg:flex items-center bg-deti-card rounded-full px-3 py-1.5 border border-deti-border focus-within:border-deti-primary/50 transition-colors w-64">
          <Search className="w-4 h-4 text-deti-subtext" />
          <input 
            type="text" 
            placeholder="Search coin, pair, or feature" 
            className="bg-transparent border-none outline-none text-sm text-deti-text ml-2 w-full placeholder-deti-subtext"
          />
          <span className="text-xs text-deti-subtext border border-deti-border rounded px-1">/</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <select
            aria-label="Select language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="hidden md:inline-block bg-deti-card border border-deti-border text-deti-text text-xs rounded-md px-2 py-1 hover:border-deti-primary transition-colors"
          >
            <option value="en">EN</option>
            <option value="vi">VI</option>
            <option value="ar">AR</option>
          </select>
          <button className="p-2 rounded-full hover:bg-deti-surface text-deti-subtext hover:text-deti-text transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView(AppView.WALLET)}
            className="hidden sm:flex items-center gap-2 bg-gradient-brand text-white border border-white/10 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg hover:shadow-glow transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect</span>
          </button>
          <button className="w-8 h-8 rounded-full bg-deti-card border border-deti-border flex items-center justify-center text-xs font-bold text-deti-text hover:border-deti-secondary transition-colors">
            U
          </button>
          <button className="md:hidden p-2 text-deti-subtext">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
