
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Sun, Moon, LogIn, ChevronDown, User as UserIcon, ShieldCheck, ShieldAlert, LogOut, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '../types';

interface TopBarProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  user: UserProfile | null;
  onLoginClick: () => void;
  onKYCClick: () => void;
  onLogout?: () => void;
  onHomeClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = React.memo(({ isDarkMode, toggleTheme, user, onLoginClick, onKYCClick, onLogout, onHomeClick }) => {
  const { t, i18n } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'vi', label: 'Tiếng Việt' }
  ];

  const normalizedLang = (i18n.language || 'en').split('-')[0];
  const activeLanguage = languages.find((lang) => lang.code === normalizedLang) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setShowLanguageMenu(false);
  };

  return (
    <header className="h-16 lg:h-20 bg-deti-bg/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40">
      {/* Logo + Home */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onHomeClick}>
        <img src="https://i.postimg.cc/3Rj9YpjK/Group-83.png" alt="Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Language Selector */}
      <div className="relative">
        <button
          onClick={() => setShowLanguageMenu((prev) => !prev)}
          className="flex items-center gap-1 px-3 py-2 rounded-full border border-white/10 text-sm text-white/80 hover:text-white hover:border-deti-primary/60 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{activeLanguage.label}</span>
          <ChevronDown size={12} className={`transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
        </button>
        {showLanguageMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-deti-card/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-white/10 ${lang.code === activeLanguage.code ? 'text-white' : 'text-deti-subtext'}`}
              >
                <span>{lang.label}</span>
                {lang.code === activeLanguage.code && <ShieldCheck size={14} className="text-deti-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Search */}
      <div className="hidden lg:flex flex-1 max-w-md">
        <div className="w-full relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t('topbar.searchPlaceholder')} 
            className="w-full bg-white/5 dark:bg-white/5 border border-white/10 focus:border-deti-primary/50 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all placeholder-deti-subtext hover:bg-white/10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        {toggleTheme && (
           <button 
             onClick={toggleTheme}
             className="p-2 text-deti-subtext hover:text-deti-primary transition-colors rounded-full hover:bg-white/5"
           >
             {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>
        )}
        <button className="hidden sm:block p-2 text-deti-subtext hover:text-deti-primary transition-colors">
          <HelpCircle className="w-6 h-6" />
        </button>
        <div className="relative">
          <button className="p-2 text-deti-subtext hover:text-deti-primary transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-deti-danger rounded-full border border-deti-bg"></span>
          </button>
        </div>
        
        <div className="h-6 lg:h-8 w-[1px] bg-white/10 mx-1"></div>

        {user ? (
          <div className="relative">
            <div 
               className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:bg-white/5 p-1.5 lg:p-2 rounded-xl transition-colors"
               onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">{user.name}</div>
                <div className="flex items-center justify-end gap-1">
                   {user.kycStatus === 'Verified' ? (
                      <span className="text-[10px] text-deti-success flex items-center"><ShieldCheck size={10} className="mr-0.5" /> Verified</span>
                   ) : (
                      <span className="text-[10px] text-deti-danger flex items-center"><ShieldAlert size={10} className="mr-0.5" /> {user.kycStatus}</span>
                   )}
                </div>
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-deti-primary to-deti-secondary p-[2px]">
                 <div className="w-full h-full rounded-full bg-deti-card flex items-center justify-center overflow-hidden">
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                 </div>
              </div>
              <ChevronDown size={14} className="text-deti-subtext hidden sm:block" />
            </div>
            
            {showProfileMenu && (
               <div className="absolute top-full right-0 mt-2 w-48 bg-deti-card/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 sm:hidden border-b border-white/10 mb-2">
                     <p className="text-sm font-bold text-white">{user.name}</p>
                     <p className="text-xs text-deti-subtext">{user.email || user.phone}</p>
                  </div>
                  <button 
                    onClick={() => { setShowProfileMenu(false); onKYCClick(); }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-white flex items-center gap-2"
                  >
                    <ShieldCheck size={16} /> {t('topbar.identityVerification')}
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-white flex items-center gap-2">
                    <UserIcon size={16} /> {t('topbar.profileSettings')}
                  </button>
                  {onLogout && (
                    <button 
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-deti-danger flex items-center gap-2 border-t border-white/10 mt-1"
                    >
                       <LogOut size={16} /> {t('topbar.logout')}
                    </button>
                  )}
               </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="px-3 py-1.5 lg:px-6 lg:py-2.5 bg-gradient-brand/90 hover:bg-gradient-brand backdrop-blur-sm text-white rounded-lg lg:rounded-xl font-bold text-[10px] lg:text-sm shadow-lg hover:shadow-glow-gold hover:-translate-y-0.5 transition-all flex items-center gap-1.5 lg:gap-2 border border-white/10"
          >
             <LogIn size={14} className="lg:w-4 lg:h-4" /> {t('topbar.login')}
          </button>
        )}
      </div>
    </header>
  );
});
