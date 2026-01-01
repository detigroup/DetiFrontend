
import React, { useEffect, useMemo, useState } from 'react';
import { AppView } from '../types';
import { MOCK_PAIRS } from '../constants';
import { useTranslation } from 'react-i18next';
import { 
   ArrowRight, Shield, Globe, TrendingUp, Play, RefreshCw, Sun, Moon, Bell, ArrowUpRight, ChevronDown,
  LayoutGrid, Wallet, Settings, ArrowRightLeft, CheckCircle2, 
  Award, Landmark, FileCheck, Star, Target, Gem,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Send, MessageSquare, Gamepad2,
  Box, PieChart, Gavel, Scale, Server, Leaf, Building, Film, Palette
} from 'lucide-react';

interface LandingHeroProps {
  setView: (view: AppView) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

// RWA Marquee Data - Updated to NFT Style content
const RWA_ITEMS = [
  { 
    title: 'Modular Data Center', 
    image: 'https://plus.unsplash.com/premium_photo-1740363268539-cd9093c3b5d1?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    apy: '15%', 
    min: '$1,000', 
    type: 'Infrastructure' 
  },
  { 
    title: 'Sustainable Farm', 
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop', 
    apy: '8.5%', 
    min: '$50', 
    type: 'Agriculture' 
  },
  { 
    title: 'Luxury Apartment', 
    image: 'https://images.unsplash.com/photo-1757924432508-d4e92411caeb?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTF8fEx1eHVyeSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D', 
    apy: '12%', 
    min: '$500', 
    type: 'Real Estate' 
  },
  { 
    title: 'Solar Energy Grid', 
    image: 'https://plus.unsplash.com/premium_photo-1679917152411-353fd633e218?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHNvbGFyJTIwZW5lcmd5fGVufDB8fDB8fHww', 
    apy: '10.2%', 
    min: '$250', 
    type: 'Energy' 
  },
  { 
    title: 'Carbon Credits', 
    image: 'https://plus.unsplash.com/premium_photo-1742202420252-a3416772f068?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fHw%3D', 
    apy: 'Dynamic', 
    min: '$100', 
    type: 'ESG' 
  },
  { 
    title: 'Gold & Silver Reserves', 
    image: 'https://images.unsplash.com/photo-1632113988478-689c0ccc39a7?q=80&w=2662&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    apy: '5.5%', 
    min: '$50', 
    type: 'Commodities' 
  },
  { 
    title: 'Intellectual Property', 
    image: 'https://i.postimg.cc/PqS8h2zw/image-94.png', 
    apy: '18%', 
    min: '$2,500', 
    type: 'License & Rights' 
  },
  { 
    title: 'Fine Art Collection', 
    image: 'https://images.unsplash.com/photo-1733324466782-8feab1ca21ba?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    apy: '11%', 
    min: '$1,000', 
    type: 'Arts & Collectibles' 
  },
];

export const LandingHero: React.FC<LandingHeroProps> = ({ setView, isDarkMode, toggleTheme }) => {
   const { t, i18n } = useTranslation();
   const [showLanguageMenu, setShowLanguageMenu] = useState(false);

   const languages = useMemo(() => ([
      { code: 'en', label: 'English' },
      { code: 'vi', label: 'Tiếng Việt' }
   ]), []);

   const normalizedLang = (i18n.language || 'en').split('-')[0];
   const activeLanguage = languages.find((lang) => lang.code === normalizedLang) || languages[0];

   const navItems = useMemo(() => ([
      { key: 'markets', label: t('nav.markets'), target: 'markets' },
      { key: 'spot', label: t('nav.spot'), target: 'spot' },
      { key: 'rwa', label: t('nav.rwa'), target: 'rwa' },
      { key: 'wallet', label: t('nav.wallet'), target: 'wallet' },
      { key: 'earn', label: t('nav.earn'), target: 'earn' },
      { key: 'vip', label: t('nav.vip'), target: 'features' }
   ]), [t]);

   const handleLanguageChange = (code: string) => {
      i18n.changeLanguage(code);
      setShowLanguageMenu(false);
   };
  
  useEffect(() => {
    // Initialize Unicorn Studio Script
    const initUnicorn = () => {
      const win = window as any;
      if (!win.UnicornStudio) {
        win.UnicornStudio = { isInitialized: false };
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js";
        script.onload = () => {
           if (!win.UnicornStudio.isInitialized) {
              win.UnicornStudio.init();
              win.UnicornStudio.isInitialized = true;
           }
        };
        document.head.appendChild(script);
      } else {
         if (win.UnicornStudio.init) {
             win.UnicornStudio.init();
         }
      }
    };
    initUnicorn();

    // Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
          if (entry.isIntersecting) {
             entry.target.classList.add('visible');
             // Optional: Stop observing once visible to run only once
             // observer.unobserve(entry.target); 
          }
       });
    }, { 
       threshold: 0.1,
       rootMargin: "0px 0px -50px 0px" // Trigger slightly before element is fully in view
    });

    const elements = document.querySelectorAll('.morph-reveal');
    elements.forEach(el => observer.observe(el));

    return () => {
       observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-deti-bg text-deti-text font-sans overflow-x-hidden selection:bg-deti-primary/30 relative flex flex-col transition-colors duration-300">
      
      {/* 1. Immersive Animated Background (Unicorn Studio) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Unicorn Studio Embed - Updated ID and blur */}
         <div 
            data-us-project="X0ErZR3QhPzMHfKgBbJJ" 
            data-us-scale="0.5"
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0,
              filter: 'blur(35px)', // Decreased blur intensity by ~25%
              transform: 'scale(1.1)' // slight scale to prevent blurred edges from showing white
            }}
         ></div>

         {/* Gradient Overlay for text readability - Adjusted to show the background */}
         <div className="absolute inset-0 bg-gradient-to-b from-deti-bg/60 via-deti-bg/70 to-deti-bg"></div>
      </div>

      {/* 2. Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full relative z-50 morph-reveal">
        {/* Updated Logo: Reduced Size further by 25% (h-12 -> h-10) */}
        <div 
           className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-300" 
           onClick={() => setView(AppView.DASHBOARD)}
        >
           <img 
              src="https://i.postimg.cc/3Rj9YpjK/Group-83.png" 
              alt="DETI HOLD" 
              className="h-10 w-auto object-contain drop-shadow-md"
           />
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-8 text-xs font-medium text-deti-subtext uppercase tracking-widest">
                     {navItems.map((item) => (
                         <button 
                            key={item.key} 
                            onClick={(e) => {
                                 e.preventDefault();
                                 scrollToSection(item.target);
                            }}
                            className="hover:text-deti-primary transition-colors relative group"
                         >
                              {item.label}
                              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-deti-primary transition-all duration-300 group-hover:w-full"></span>
                         </button>
                     ))}
            </div>
                  <div className="relative md:hidden">
                     <button
                        onClick={() => setShowLanguageMenu((prev) => !prev)}
                        className="p-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-deti-primary/60 transition-colors"
                     >
                        <Globe className="w-5 h-5" />
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
                                 {lang.code === activeLanguage.code && <CheckCircle2 size={14} className="text-deti-primary" />}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                  <div className="relative hidden md:block">
                     <button
                        onClick={() => setShowLanguageMenu((prev) => !prev)}
                        className="flex items-center gap-1 px-3 py-2 rounded-full border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:border-deti-primary/60 transition-colors"
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
                                 {lang.code === activeLanguage.code && <CheckCircle2 size={14} className="text-deti-primary" />}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
            {toggleTheme && (
               <button 
                 onClick={toggleTheme}
                 className="p-2 text-deti-subtext hover:text-deti-primary transition-colors rounded-full border border-transparent hover:border-deti-border"
               >
                 {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
            )}
            <button 
              onClick={() => setView(AppView.DASHBOARD)}
              className="shiny-cta focus:outline-none"
            >
                     <span className="!px-5 !py-2.5 md:!px-8 md:!py-3 text-xs md:text-sm font-semibold">{t('hero.ctaSignup')}</span>
            </button>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative pt-20 pb-32 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center z-10">
         <div className="space-y-8">
            {/* Apple Style Header with Brand Gradient Highlight */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] tracking-tighter text-white">
                     <span className="block morph-reveal delay-100 bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">{t('hero.title.worlds')}</span>
              <span className="block morph-reveal delay-200">
                {/* Brand Orange/Gold Gradient */}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-[#FCD34D] to-[#EA580C] animate-text-shimmer bg-[length:200%_auto]">{t('hero.title.globalCrypto')}</span>
              </span>
                     <span className="block morph-reveal delay-300 bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">{t('hero.title.exchange')}</span>
            </h1>
            
            <p className="morph-reveal delay-400 text-deti-subtext text-lg md:text-xl max-w-lg leading-relaxed font-light border-l-2 border-white/10 pl-6">
                     {t('hero.subtitle')}
            </p>
            
            <div className="morph-reveal delay-500 flex items-center gap-4">
               <button 
                 onClick={() => setView(AppView.DASHBOARD)}
                 className="shiny-cta focus:outline-none"
               >
                 <span className="">
                            {t('hero.ctaStart')} <ArrowRight className="w-4 h-4 ml-1" />
                 </span>
               </button>
               
               <button className="shiny-cta group focus:outline-none rounded-full">
                  <span className="!p-4 bg-deti-bg rounded-full">
                     <Play className="w-5 h-5 text-deti-text fill-current group-hover:scale-110 transition-transform" />
                  </span>
               </button>
            </div>
         </div>

         {/* 3D Visual Abstract - iPhone Mockup - VISIBLE ON MOBILE NOW */}
         <div className="relative h-[500px] lg:h-[600px] w-full block perspective-1000 morph-reveal delay-300 mt-12 lg:mt-0">
             
             {/* iPhone Mockup Container - Straight - Scaled for Mobile */}
             <div 
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[640px] z-20 transform scale-[0.85] sm:scale-100 transition-transform duration-500"
             >
                 <div className="relative w-full h-full animate-float-slow">
                    {/* New Mockup Image */}
                    <img 
                       src="https://i.postimg.cc/Y9x6FmVB/Group-94-(1).png" 
                       alt="Mobile Trading Interface" 
                       className="w-full h-full object-contain drop-shadow-2xl"
                    />
                 </div>
             </div>

             {/* Orbital Elements - Adjusted positions for phone */}
             <FloatingElement delay="0s" className="top-[10%] right-[5%] w-20 h-20 bg-deti-card border-deti-secondary/50">
                 {/* Bitcoin SVG - Floating Orb */}
                 <div className="w-10 h-10">
                   <svg viewBox="0 0 32 32" className="w-full h-full">
                     <g fill="none" fillRule="evenodd">
                       <circle cx="16" cy="16" r="16" fill="#F7931A"/>
                       <path fill="#FFF" fillRule="nonzero" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.842s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.402-1.594-4.212 1.132-.26 1.986-1.003 2.213-2.538zm-3.962 5.617c-.542 2.175-4.206.999-5.396.705l.963-3.858c1.19.297 5.056.881 4.433 3.153zm.538-5.637c-.496 1.987-3.555.977-4.545.732l.873-3.498c.99.247 4.187.71 3.672 2.766z"/>
                     </g>
                   </svg>
                 </div>
             </FloatingElement>

             <FloatingElement delay="1s" className="bottom-[20%] left-[5%] w-16 h-16 bg-deti-card border-deti-primary/50">
                 {/* Ethereum SVG */}
                 <div className="w-8 h-8">
                   <svg viewBox="0 0 32 32" className="w-full h-full">
                     <g fill="none" fillRule="evenodd">
                       <circle cx="16" cy="16" r="16" fill="#627EEA"/>
                       <g fill="#FFF" fillRule="nonzero">
                         <path d="M16.498 4v8.87l7.497 3.35z" opacity=".602"/>
                         <path d="M16.498 4L9 16.22l7.498-3.35z"/>
                         <path d="M16.498 21.968v6.027L24 17.616z" opacity=".602"/>
                         <path d="M16.498 27.995v-6.028L9 17.616z"/>
                         <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" opacity=".2"/>
                         <path d="M9 16.22l7.498 4.353v-7.701z" opacity=".602"/>
                       </g>
                     </g>
                   </svg>
                 </div>
             </FloatingElement>

             <FloatingElement delay="2s" className="top-[30%] left-[10%] w-12 h-12 bg-deti-card border-deti-border">
                 {/* Solana SVG */}
                 <div className="w-6 h-6">
                    <svg viewBox="0 0 32 32" className="w-full h-full">
                        <circle cx="16" cy="16" r="16" fill="#000000"/>
                        <path d="M6 9 L9 6 H26 L23 9 H6 Z" fill="#14F195"/>
                        <path d="M6 15 H23 L26 18 H9 L6 15 Z" fill="#9945FF"/><path d="M6 21 L9 18 H26 L23 21 H6 Z" fill="#14F195"/>
                    </svg>
                 </div>
             </FloatingElement>
         </div>
      </section>

      {/* 4. Feature Cards Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 relative z-10 w-full">
         <div className="grid md:grid-cols-3 gap-8">
            <GlowCard 
               delay="100ms"
               color="gold"
               icon={<Globe className="w-6 h-6" />}
               title={t('features.globalReach.title')}
               desc={t('features.globalReach.desc')}
            />
            <GlowCard 
               delay="200ms"
               color="blue"
               icon={<TrendingUp className="w-6 h-6" />}
               title={t('features.deepLiquidity.title')}
               desc={t('features.deepLiquidity.desc')}
            />
            <GlowCard 
               delay="300ms"
               color="dark"
               icon={<Shield className="w-6 h-6" />}
               title={t('features.bankGradeSecurity.title')}
               desc={t('features.bankGradeSecurity.desc')}
            />
         </div>
      </section>

      {/* 4.5. About Us Section */}
      <section id="about" className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="mb-12 morph-reveal">
                  <span className="text-deti-secondary font-medium tracking-wide text-sm uppercase flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-deti-secondary"></div> {t('about.label')}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-deti-text mt-3 max-w-4xl">
                    {t('about.headingPrefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#EA580C] whitespace-nowrap">{t('about.headingBrand')}</span>.
                  </h2>
                  <p className="text-deti-subtext text-lg mt-4 max-w-2xl">
                    {t('about.paragraph')}
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Card 1: Main Mission (Dark Glass) - Spans 7 cols (approx 60%) */}
                  <div className="md:col-span-7 bg-deti-card/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl brand-lighting-box relative overflow-hidden group morph-reveal delay-100 flex flex-col justify-center min-h-[320px]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-deti-primary/10 rounded-full blur-[80px] group-hover:bg-deti-primary/20 transition-all"></div>
                      <div className="relative z-10">
                          {/* Updated Icon to use Branded Color */}
                          <div className="w-12 h-12 bg-deti-primary/10 rounded-xl flex items-center justify-center mb-6 text-deti-primary border border-deti-primary/20">
                              <Target size={24} />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">{t('about.missionTitle')}</h3>
                          <p className="text-deti-subtext leading-relaxed mb-6">
                             {t('about.missionDesc')}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white">
                             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-deti-primary"/> {t('about.pill.transparency')}</span>
                             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-deti-primary"/> {t('about.pill.innovation')}</span>
                             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-deti-primary"/> {t('about.pill.securityCompliance')}</span>
                          </div>
                      </div>
                  </div>

                  {/* Card 2: Global Reach (Map/Image) - Spans 5 cols (approx 40%) */}
                  <div className="md:col-span-5 relative min-h-[320px] rounded-3xl overflow-hidden border border-white/10 group brand-lighting-box morph-reveal delay-200">
                      <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" alt="Global Network" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8">
                          <h3 className="text-2xl font-bold text-white mb-1">Global Reach</h3>
                          {/* Updated Global Reach Text */}
                          <p className="text-deti-subtext text-sm">Operating in 53+ Countries with 24/7 multilingual support teams.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 4.6. Markets Section */}
      <section id="markets" className="pt-24 pb-10 relative z-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 morph-reveal">
                  <div>
                      <span className="text-deti-primary font-medium tracking-wide text-sm uppercase flex items-center gap-2">
                          <div className="w-8 h-[1px] bg-deti-primary"></div> {t('markets.label')}
                      </span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter text-deti-text mt-3">
                          {t('markets.heading')}
                      </h2>
                  </div>
                  <button onClick={() => setView(AppView.TRADING)} className="group flex items-center gap-2 text-sm font-bold text-deti-subtext hover:text-white transition-colors">
                       {t('markets.cta')} 
                      <span className="p-1 rounded-full bg-white/5 group-hover:bg-deti-primary group-hover:text-white transition-colors">
                        <ArrowRight size={14} />
                      </span>
                  </button>
              </div>
          </div>

          {/* Marquee Container */}
          <div className="relative w-full morph-reveal delay-200">
              <div className="flex gap-6 animate-[scroll_40s_linear_infinite] w-max px-6 hover:[animation-play-state:paused]">
                  {[...MOCK_PAIRS, ...MOCK_PAIRS, ...MOCK_PAIRS].map((pair, idx) => (
                      <MarketCard key={`${pair.symbol}-${idx}`} pair={pair} />
                  ))}
              </div>
              {/* Gradient Masks for smooth fade edges */}
              <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-deti-bg to-transparent z-10 pointer-events-none"></div>
              <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-deti-bg to-transparent z-10 pointer-events-none"></div>
          </div>
          
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.33%); }
            }
          `}</style>
      </section>

      {/* 5. Spot Trading Section (Image Left, Text Right) - Even Spacing Applied */}
      <section id="spot" className="py-24 relative overflow-hidden bg-transparent">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
           {/* Visual Representation of Spot Trading (Macbook Mockup) - Scaled Up */}
           <div className="order-2 md:order-1 relative min-h-[400px] lg:min-h-[600px] flex items-center justify-center morph-reveal delay-200">
               {/* Scaling Wrapper - Decreased size by ~20% (150% -> 120%) and adjusted margin (-25% -> -10%) */}
               <div className="w-full md:w-[120%] max-w-none md:-ml-[10%] relative z-0 flex justify-center">
                  <LaptopMockup />
               </div>
           </div>

           <div className="order-1 md:order-2 space-y-6 morph-reveal relative z-10">
              <span className="text-deti-secondary font-medium tracking-wide text-sm uppercase">Advanced Trading</span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-deti-text">Spot Trading</h2>
              <p className="text-deti-subtext text-lg leading-relaxed">
                 Access 200+ cryptocurrencies with high-speed execution. Our high-performance matching engine ensures stable and fast execution even during peak market volatility.
              </p>
              <ul className="space-y-3 text-deti-subtext">
                 {['Unified Margin Account', 'Advanced Order Types', 'Real-time Risk Management'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-deti-primary"></div> {item}
                    </li>
                 ))}
              </ul>
              <button 
                onClick={() => setView(AppView.TRADING)} 
                className="shiny-cta focus:outline-none mt-4"
              >
                 <span className="">
                   Explore Markets <ArrowRight className="w-4 h-4 ml-1" />
                 </span>
              </button>
           </div>
        </div>
      </section>

      {/* 6. RWA Marketplace Section (REDESIGNED) - Even Spacing Applied */}
      <section id="rwa" className="py-24 relative overflow-hidden bg-transparent">
         {/* Background Elements to blend - Transparent BG as requested */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-deti-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center mb-12">
            {/* Left Content */}
            <div className="space-y-8 morph-reveal">
               <div>
                  <span className="text-deti-primary font-bold tracking-widest text-xs uppercase mb-2 block">
                     Real World Assets (RWA) <span className="text-deti-subtext normal-case tracking-normal ml-1">(Coming Soon)</span>
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white mb-4">
                     RWA NFT Marketplace
                  </h2>
                  <p className="text-deti-subtext text-lg leading-relaxed max-w-xl">
                     Invest in the future with fractionalized Real World Assets. Own a piece of premium Real Estate, high-yield Data Centers, and verified Carbon Credits directly on the blockchain.
                  </p>
               </div>

               {/* Feature Grid with Enhanced Glass Boxes and Lighting Hover Effect - RESIZED */}
               <div className="grid grid-cols-2 gap-3 max-w-[90%]">
                  <FeatureBox 
                     icon={<Box size={20}/>} 
                     title="Tokenization" 
                     desc="Physical assets to digital tokens." 
                  />
                  <FeatureBox 
                     icon={<PieChart size={20}/>} 
                     title="Fractionalization" 
                     desc="Low entry for high-value assets." 
                  />
                  <FeatureBox 
                     icon={<Gavel size={20}/>} 
                     title="Marketplace" 
                     desc="Trade asset-backed tokens." 
                  />
                  <FeatureBox 
                     icon={<Scale size={20}/>} 
                     title="Legal Compliance" 
                     desc="Fully compliant framework." 
                  />
               </div>

               {/* Buttons */}
               <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setView(AppView.NFT)} 
                    className="shiny-cta focus:outline-none"
                  >
                     <span>Explore Marketplace <ArrowRight className="w-4 h-4 ml-1" /></span>
                  </button>
                  <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-white font-bold transition-all">
                     Mint RWA Token
                  </button>
               </div>
            </div>

            {/* Right Image - Specific Image from request */}
            <div className="relative flex items-center justify-center morph-reveal delay-200">
               <div className="relative w-full max-w-[600px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-[80px] rounded-full -z-10"></div>
                  <img 
                    src="https://i.postimg.cc/8zN3jQYQ/Group_86_(1).png" 
                    alt="RWA Marketplace Visual" 
                    className="relative z-10 w-full h-auto object-contain animate-float-medium drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  />
               </div>
            </div>
         </div>

         {/* NEW MARQUEE - NFT Style Cards */}
         <div className="relative w-full morph-reveal delay-300" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
              <div className="flex gap-6 animate-[scroll_40s_linear_infinite] w-max px-6 hover:[animation-play-state:paused]">
                  {[...RWA_ITEMS, ...RWA_ITEMS, ...RWA_ITEMS, ...RWA_ITEMS].map((item, idx) => (
                      <RWACard key={`${item.title}-${idx}`} item={item} />
                  ))}
              </div>
         </div>
      </section>

      {/* 7. DETI Wallet & Card Section (Image Left, Text Right) - Even Spacing Applied */}
      <section id="wallet" className="py-24 relative overflow-hidden bg-transparent">
         {/* Background Elements */}
         <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-deti-primary/5 rounded-full blur-[120px] -z-10"></div>

         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            {/* Visual Side */}
            <div className="relative flex items-center justify-center morph-reveal order-2 md:order-1">
                {/* Updated Visual with Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-deti-primary/20 to-deti-secondary/20 rounded-full blur-[60px]"></div>
                  <img
                    src="https://i.postimg.cc/cHmjTFdV/dreamina-2025-12-14-1886-Enhance-the-quality-to-4K-resolution-ma-1.png"
                    alt="DETI Premium Card"
                    className="relative z-10 w-full max-w-[500px] h-auto object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500 rounded-lg"
                  />
                </div>
            </div>

            <div className="space-y-6 morph-reveal delay-200 order-1 md:order-2">
               <span className="text-deti-secondary font-medium tracking-wide text-sm uppercase">Web3 & Lifestyle</span>
               <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-deti-text">DETI Wallet & Card</h2>
               <p className="text-deti-subtext text-lg leading-relaxed">
                  Bridge the gap between decentralized finance and real-world spending. 
                  Connect to thousands of dApps, collect NFTs, and explore the world of Web3 with our non-custodial wallet. 
                  Then, spend your crypto gains instantly at over 50 million merchants worldwide with the Digital DETI Card.
               </p>
               <ul className="space-y-3 text-deti-subtext">
                  {['Web3 dApp Browser', 'NFT Gallery & Management', 'Instant Crypto-to-Fiat Spending', 'up to 5% Crypto Back'].map(item => (
                     <li key={item} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-deti-primary"></div> {item}
                     </li>
                  ))}
               </ul>
               <div className="flex gap-4 mt-4">
                   <button onClick={() => setView(AppView.WALLET)} className="shiny-cta focus:outline-none">
                      <span>Create Wallet</span>
                   </button>
               </div>
            </div>

         </div>
      </section>

      {/* 8. Fiat Gateway (Text Left, Image Right) */}
      <section className="py-24 relative bg-transparent">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-6 morph-reveal">
              <span className="text-deti-primary font-medium tracking-wide text-sm uppercase">Global On-Ramp</span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-deti-text">Fiat Gateway</h2>
              <p className="text-deti-subtext text-lg leading-relaxed">
                 Seamlessly convert USD, EUR, GBP, and 50+ fiat currencies into crypto. We support major payment methods including Visa, Mastercard, and Bank Transfers with competitive rates.
              </p>
              <button 
                onClick={() => setView(AppView.SWAP)} 
                className="shiny-cta focus:outline-none mt-4"
              >
                 <span>Buy Crypto</span>
              </button>
           </div>
           
           <div className="relative h-[400px] morph-reveal delay-200 flex items-center justify-center">
               <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full"></div>
               <img 
                  src="https://i.postimg.cc/3WQQ07sK/Group-93-(2).png" 
                  alt="Fiat Gateway Interface" 
                  className="relative z-10 w-full max-w-[500px] h-auto object-contain drop-shadow-2xl animate-float-slow"
               />
           </div>
        </div>
      </section>

      {/* 9. Earn Gems & Swap (NEW) */}
      <section id="earn" className="py-24 relative bg-transparent">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            <div className="relative flex items-center justify-center morph-reveal order-2 md:order-1">
                <div className="relative w-full flex items-center justify-center">
                   <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full -z-10 animate-pulse-slow"></div>
                   <img 
                      src="https://i.postimg.cc/4NjbbGkB/dreamina-2025-12-14-5877-Thie-t-ke-la-m-vie-n-kim-cu-o-ng-to-nha-t-o-tr-1-(1).png" 
                      alt="Earn Gems Gamification" 
                      className="relative z-10 w-full max-w-[800px] h-auto object-contain drop-shadow-2xl animate-float-slow hover:scale-105 transition-transform duration-500"
                   />
                </div>
            </div>

            <div className="space-y-6 morph-reveal delay-200 order-1 md:order-2">
               <span className="text-deti-secondary font-medium tracking-wide text-sm uppercase flex items-center gap-2">
                  <Award size={16} /> Gamified Rewards <span className="normal-case tracking-normal opacity-70 font-semibold">(Coming Soon)</span>
               </span>
               <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-deti-text">
                  Earn Gems & Swap
               </h2>
               <p className="text-deti-subtext text-lg leading-relaxed">
                  Engage with DETI to unlock exclusive rewards. Complete daily trading quests, learn-to-earn challenges, and social tasks to accumulate DETI Gems.
               </p>
               <p className="text-deti-subtext text-lg leading-relaxed">
                  Convert your hard-earned Gems directly into DETI Tokens or use them to discount trading fees and unlock VIP tiers.
               </p>
               <ul className="space-y-3 text-deti-subtext">
                  {['Daily Login Bonuses', 'Trading Volume Milestones', 'Referral Rewards', 'Instant Token Swaps'].map(item => (
                     <li key={item} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-deti-primary"></div> {item}
                     </li>
                  ))}
               </ul>
               <button className="shiny-cta focus:outline-none mt-4 opacity-70 cursor-not-allowed">
                  <span>Start Earning <ArrowRight className="w-4 h-4 ml-1" /></span>
               </button>
            </div>
         </div>
      </section>

      {/* 10. Security & Compliance (NEW) */}
      <section id="security" className="py-24 bg-transparent relative">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 morph-reveal">
                <span className="text-deti-primary font-medium tracking-wide text-sm uppercase">Trust & Safety</span>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-deti-text mt-2 mb-4">Security & Compliance</h2>
                <p className="text-deti-subtext max-w-2xl mx-auto">
                   We adhere to the strictest regulatory standards globally, ensuring your assets are protected by bank-grade security protocols.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <ComplianceCard 
                  icon={<Star size={24} />} 
                  title="Vietnam Sandbox" 
                  desc="Participating in the national Fintech Regulatory Sandbox, ensuring fully compliant operations for digital asset exchange within Vietnam."
                  delay="100ms"
               />
               <ComplianceCard 
                  icon={<Landmark size={24} />} 
                  title="Dubai (VARA/ADGM)" 
                  desc="Operating under the regulatory framework of Dubai's Virtual Assets Regulatory Authority (VARA) and ADGM standards for global operations."
                  delay="200ms"
               />
               <ComplianceCard 
                  icon={<FileCheck size={24} />} 
                  title="Global KYC/AML" 
                  desc="Implementing rigorous International Know Your Customer (KYC) and Anti-Money Laundering (AML) screenings to ensure a safe trading environment."
                  delay="300ms"
               />
            </div>
         </div>
      </section>

      {/* 11. Footer */}
      <footer className="pt-20 pb-10 relative z-10 text-sm bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
                  
                  {/* Brand Column */}
                  <div className="col-span-2 lg:col-span-2 space-y-6">
                      <div className="flex items-center gap-2 cursor-pointer">
                         <img src="https://i.postimg.cc/3Rj9YpjK/Group-83.png" alt="DETI HOLD" className="h-10 w-auto object-contain" />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 w-fit">
                          <SocialButton icon={<Facebook size={20} />} />
                          <SocialButton icon={<Twitter size={20} />} />
                          <SocialButton icon={<Instagram size={20} />} />
                          <SocialButton icon={<Youtube size={20} />} />
                          <SocialButton icon={<Linkedin size={20} />} />
                          <SocialButton icon={<Send size={20} />} /> {/* Telegram */}
                          <SocialButton icon={<MessageSquare size={20} />} /> {/* Reddit */}
                          <SocialButton icon={<Gamepad2 size={20} />} /> {/* Discord */}
                      </div>
                  </div>

                  {/* About */}
                  <div>
                      <h4 className="text-deti-primary font-bold mb-6 text-base">About</h4>
                      <ul className="space-y-4 text-gray-400">
                          <FooterLink>About DETI</FooterLink>
                          <FooterLink>Our Team</FooterLink>
                          <FooterLink>Press Room</FooterLink>
                          <FooterLink>DETI Communities</FooterLink>
                          <FooterLink>Announcements</FooterLink>
                          <FooterLink>Risk Disclosure</FooterLink>
                          <FooterLink>Careers</FooterLink>
                          <FooterLink>Fees & Transactions</FooterLink>
                      </ul>
                  </div>

                  {/* Services */}
                  <div>
                      <h4 className="text-deti-primary font-bold mb-6 text-base">Services</h4>
                      <ul className="space-y-4 text-gray-400">
                          <FooterLink>One-Click Buy</FooterLink>
                          <FooterLink>P2P Trading (0 Fees)</FooterLink>
                          <FooterLink>VIP Program</FooterLink>
                          <FooterLink>Referral Program</FooterLink>
                          <FooterLink>Institutional Services</FooterLink>
                          <FooterLink>Listing Application</FooterLink>
                          <FooterLink>Tax API</FooterLink>
                          <FooterLink>Audit</FooterLink>
                      </ul>
                  </div>

                  {/* Support */}
                  <div>
                      <h4 className="text-deti-primary font-bold mb-6 text-base">Support</h4>
                      <ul className="space-y-4 text-gray-400">
                          <FooterLink>Submit a Request</FooterLink>
                          <FooterLink>Help Center</FooterLink>
                          <FooterLink>Support Hub</FooterLink>
                          <FooterLink>User Feedback</FooterLink>
                          <FooterLink>DETI Learn</FooterLink>
                          <FooterLink>Trading Fees</FooterLink>
                          <FooterLink>API Documentation</FooterLink>
                          <FooterLink>Authenticity Check</FooterLink>
                      </ul>
                  </div>

                  {/* Products */}
                  <div>
                      <h4 className="text-deti-primary font-bold mb-6 text-base">Products</h4>
                      <ul className="space-y-4 text-gray-400">
                          <FooterLink>Spot Trade</FooterLink>
                          <FooterLink>Earn</FooterLink>
                          <FooterLink>Launchpad</FooterLink>
                          <FooterLink>DETI Card</FooterLink>
                          <FooterLink>RWA Marketplace</FooterLink>
                          <FooterLink>TradingView</FooterLink>
                      </ul>
                  </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
                  <p className="text-left">© 2025 Detihold.com. All rights reserved.</p>
                  <div className="flex gap-3 text-right">
                      <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                      <span>|</span>
                      <a href="#" className="hover:text-white transition-colors">Privacy Terms</a>
                  </div>
              </div>
          </div>
      </footer>

    </div>
  );
};

// New RWA Card Component for Marquee - NFT Style
const RWACard: React.FC<{ item: any }> = ({ item }) => (
    <div className="w-[280px] bg-deti-card/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden brand-lighting-box group cursor-pointer hover:-translate-y-2 transition-all duration-500">
        {/* Image Area */}
        <div className="h-48 w-full relative overflow-hidden">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10">
               {item.type}
            </div>
            <div className="absolute top-3 right-3 bg-deti-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
               APY {item.apy}
            </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
            <h4 className="text-white font-bold text-lg mb-1 truncate">{item.title}</h4>
            <div className="flex items-center justify-between mt-3">
               <div className="flex flex-col">
                  <span className="text-[10px] text-deti-subtext uppercase">Min Investment</span>
                  <span className="text-sm font-bold text-white font-mono">{item.min}</span>
               </div>
               <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-deti-primary group-hover:bg-deti-primary group-hover:text-white transition-colors">
                  <ArrowRight size={14} />
               </button>
            </div>
        </div>
    </div>
);

// Simple Feature Box for RWA Section - Updated: Smaller, Shorter, No Icon Border
const FeatureBox: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
   <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl hover:border-deti-primary/50 hover:bg-white/10 transition-all duration-300 group brand-lighting-box">
      <div className="text-deti-primary mb-3 group-hover:scale-110 transition-transform p-2 bg-deti-primary/10 rounded-lg w-fit">{icon}</div>
      <h3 className="text-white font-bold mb-1 text-sm">{title}</h3>
      <p className="text-deti-subtext text-[10px] leading-relaxed">{desc}</p>
   </div>
);

// Helper for Floating Orbs
const FloatingElement: React.FC<{ children?: React.ReactNode, className: string, delay: string }> = ({ children, className, delay }) => (
    <div 
      className={`absolute rounded-full border shadow-2xl flex items-center justify-center z-10 animate-float-medium backdrop-blur-md ${className}`}
      style={{ animationDelay: delay }}
    >
       {children}
    </div>
);

const MarketCard: React.FC<{ pair: any }> = ({ pair }) => {
    const isUp = pair.change24h >= 0;
    
    // Simple Sparkline generation for visual effect
    const min = Math.min(...(pair.sparkline || []));
    const max = Math.max(...(pair.sparkline || []));
    const range = max - min || 1;
    const points = (pair.sparkline || []).map((p: number, i: number) => {
        const x = (i / (pair.sparkline.length - 1)) * 100;
        const y = 100 - ((p - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-[280px] bg-deti-card/60 backdrop-blur-xl border border-white/10 p-5 rounded-3xl brand-lighting-box group cursor-pointer hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/5 shadow-inner overflow-hidden">
                    <CryptoIcon symbol={pair.base} className="w-6 h-6" />
                </div>
                <div>
                    <div className="font-bold text-white text-base">{pair.base}</div>
                    <div className="text-xs text-deti-subtext">{pair.base}/{pair.quote}</div>
                </div>
            </div>
            
            <div className="mb-4">
                <div className="text-2xl font-bold text-white tracking-tight">
                    ${pair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${isUp ? 'text-deti-success' : 'text-deti-danger'}`}>
                    {isUp ? '+' : ''}{pair.change24h}%
                    <span className="text-deti-subtext font-normal ml-1">24h</span>
                </div>
            </div>

            {/* Sparkline */}
            <div className="h-12 w-full overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        points={points}
                        fill="none"
                        stroke={isUp ? '#10B981' : '#EF4444'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path 
                        d={`M0 100 L0 ${100 - ((pair.sparkline[0] - min)/range)*100} L ${points.split(' ').map(p => { const [x,y] = p.split(','); return `${x} ${y}`;}).join(' L ')} L 100 100 Z`}
                        fill={isUp ? 'url(#gradUp)' : 'url(#gradDown)'}
                        opacity="0.2"
                        stroke="none"
                    />
                    <defs>
                        <linearGradient id="gradUp" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradDown" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

const CryptoIcon = ({ symbol, className }: { symbol: string, className?: string }) => {
    switch(symbol) {
        case 'BTC': return (
            <svg viewBox="0 0 32 32" className={className}>
               <g fill="none" fillRule="evenodd"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path fill="#FFF" fillRule="nonzero" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.842s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.402-1.594-4.212 1.132-.26 1.986-1.003 2.213-2.538zm-3.962 5.617c-.542 2.175-4.206.999-5.396.705l.963-3.858c1.19.297 5.056.881 4.433 3.153zm.538-5.637c-.496 1.987-3.555.977-4.545.732l.873-3.498c.99.247 4.187.71 3.672 2.766z"/></g>
            </svg>
        );
        case 'ETH': return (
            <svg viewBox="0 0 32 32" className={className}>
                <g fill="none" fillRule="evenodd"><circle cx="16" cy="16" r="16" fill="#627EEA"/><g fill="#FFF" fillRule="nonzero"><path d="M16.498 4v8.87l7.497 3.35z" opacity=".602"/><path d="M16.498 4L9 16.22l7.498-3.35z"/><path d="M16.498 21.968v6.027L24 17.616z" opacity=".602"/><path d="M16.498 27.995v-6.028L9 17.616z"/><path d="M16.498 20.573l7.497-4.353-7.497-3.348z" opacity=".2"/><path d="M9 16.22l7.498 4.353v-7.701z" opacity=".602"/></g></g>
            </svg>
        );
        case 'SOL': return (
            <svg viewBox="0 0 32 32" className={className}>
                <circle cx="16" cy="16" r="16" fill="#000000"/><path d="M6 9 L9 6 H26 L23 9 H6 Z" fill="#14F195"/><path d="M6 15 H23 L26 18 H9 L6 15 Z" fill="#9945FF"/><path d="M6 21 L9 18 H26 L23 21 H6 Z" fill="#14F195"/>
            </svg>
        );
        case 'DETI': return (
            <img src="https://i.postimg.cc/W1qwFMTT/dreamina-2025-12-13-7072-Reference-Image-1-style-Reference-Image-2.png" alt="DETI" className={`rounded-full object-cover scale-[1.8] ${className}`} />
        );
        case 'XRP': return (
            <img src="https://i.postimg.cc/3xqfz8Jx/409-4096849-ripple-ripple.jpg" alt="XRP" className={`rounded-full object-cover ${className}`} />
        );
        case 'ADA': return (
            <img src="https://i.postimg.cc/QMpgShF5/cardano-ada-logo.png" alt="ADA" className={`rounded-full object-cover ${className}`} />
        );
        default: return (
            <div className={`rounded-full bg-gray-500 flex items-center justify-center text-white font-bold ${className}`} style={{fontSize: '50%'}}>{symbol[0]}</div>
        );
    }
}

// Enhanced Glass Card
const GlowCard: React.FC<{ color: 'gold' | 'blue' | 'dark', icon: React.ReactNode, title: string, desc: string, delay: string }> = ({ color, icon, title, desc, delay }) => {
  const glowColors = {
    gold: 'shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] border-amber-500/20 hover:border-amber-500/50 after:bg-amber-400',
    blue: 'shadow-[0_8px_32px_0_rgba(37,99,235,0.15)] border-blue-500/20 hover:border-blue-500/50 after:bg-blue-400',
    dark: 'shadow-[0_8px_32px_0_rgba(255,255,255,0.05)] border-white/10 hover:border-white/30 after:bg-white',
  };

  const iconColors = {
     gold: 'text-amber-400 bg-amber-400/10',
     blue: 'text-blue-400 bg-blue-400/10',
     dark: 'text-white bg-white/10',
  }

  return (
    <div 
      className={`
        relative group p-8 rounded-3xl bg-white/5 dark:bg-[#14151F]/40 backdrop-blur-xl border card-hover-effect overflow-hidden morph-reveal brand-lighting-box
        ${glowColors[color]}
        after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-1/3 after:h-[1px] after:blur-[1px] after:shadow-[0_0_15px_1px_currentColor] after:opacity-50 group-hover:after:opacity-100 after:transition-opacity
      `}
      style={{ transitionDelay: delay }}
    >
      {/* Internal Glass Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity"></div>

      {/* Internal Glow Gradient */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${color === 'gold' ? 'bg-amber-500' : color === 'blue' ? 'bg-blue-600' : 'bg-white'}`}></div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${iconColors[color]} relative z-10 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-deti-text mb-3 group-hover:translate-x-1 transition-transform relative z-10">{title}</h3>
      <p className="text-deti-subtext text-sm leading-relaxed font-light relative z-10">
        {desc}
      </p>
    </div>
  );
};

// Glass Morphism Compliance Card - UPDATED TO MATCH PREMIUM GLASS STYLE
const ComplianceCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, delay: string }> = ({ icon, title, desc, delay }) => (
   <div 
      className="bg-white/5 dark:bg-[#14151F]/40 backdrop-blur-xl border border-white/10 hover:border-deti-primary/50 hover:bg-white/10 p-8 rounded-3xl text-center morph-reveal group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden brand-lighting-box"
      style={{ transitionDelay: delay }}
   >
      {/* Enhanced Glass Effect Highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="w-14 h-14 bg-deti-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-deti-primary shadow-lg border border-deti-primary/20 group-hover:scale-110 transition-transform duration-300 relative z-10">
         {icon}
      </div>
      <h3 className="text-xl font-bold text-deti-text mb-3 relative z-10">{title}</h3>
      <p className="text-deti-subtext text-sm leading-relaxed relative z-10">{desc}</p>
   </div>
);

// Updated LaptopMockup with provided image only (simplified)
const LaptopMockup: React.FC = () => (
  <div className="relative w-full max-w-full mx-auto group perspective-1000">
     {/* Glow Effect */}
     <div className="absolute inset-0 bg-deti-primary/20 blur-[100px] rounded-full -z-10 transition-all duration-500 group-hover:bg-deti-primary/30"></div>

     {/* Image */}
     <div className="relative transform transition-transform duration-500 group-hover:scale-[1.02]">
         <img 
            src="https://i.postimg.cc/PJxX4gbs/Untitled-design-(5).png" 
            alt="Spot Trading Interface" 
            className="w-full h-auto relative z-20 drop-shadow-2xl rounded-lg"
         />
     </div>
  </div>
);

const SocialButton: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-deti-primary hover:text-white transition-all duration-300">
        {icon}
    </button>
);

const FooterLink: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li>
        <button className="hover:text-deti-primary transition-colors text-left text-sm">{children}</button>
    </li>
);
