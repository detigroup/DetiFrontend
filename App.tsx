import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, MarketPair, ChartDataPoint, PortfolioAsset, Order, UserProfile } from './types';
import { MOCK_PAIRS, INITIAL_CHART_DATA, INITIAL_ASSETS, MOCK_OPEN_ORDERS, MOCK_ORDER_HISTORY } from './constants';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { TradingChart } from './components/TradingChart';
import { OrderBook } from './components/OrderBook';
import { BuySellPanel } from './components/BuySellPanel';
import { OrderManagement } from './components/OrderManagement';
import { Dashboard } from './components/Dashboard';
import { AIAdvisor } from './components/AIAdvisor';
import { LandingHero } from './components/LandingHero';
import { Wallet } from './components/Wallet';
import { QuickSwap } from './components/QuickSwap';
import { Fees } from './components/Fees';
import { AuthModal } from './components/AuthModal';
import { KYC } from './components/KYC';
import { MintRWA } from './components/MintRWA';
import { MarketTicker } from './components/MarketTicker';
import { MarketOverview } from './components/MarketOverview';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Search, Star, CandlestickChart, List, ArrowLeftRight, Settings, Bell, ChevronDown, Monitor, Plus, LayoutGrid, ChevronLeft, Percent, ShieldCheck, BarChart2, LogOut, User as UserIcon } from 'lucide-react';

// Helper to generate realistic mock addresses
const generateMockAddress = (symbol: string, standard: string): string => {
  const hex = (len: number) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  const alpha = (len: number) => [...Array(len)].map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
  
  if (standard.includes('TRC20')) return `T${alpha(33)}`;
  if (standard.includes('ERC20') || standard.includes('BEP20') || standard.includes('Arbitrum')) return `0x${hex(40)}`;
  if (symbol === 'BTC') return `bc1q${alpha(38)}`;
  if (symbol === 'SOL') return `${alpha(44)}`;
  return `0x${hex(40)}`; // Default
};

// Debug toggle (set VITE_DEBUG=true to enable verbose logs)
const isDebug = String((import.meta as any)?.env?.VITE_DEBUG || 'false').toLowerCase() === 'true';
const maskToken = (token: string) => token ? `${token.slice(0, 6)}...${token.slice(-4)}` : 'none';
const getCookieValue = (name: string): string => {
   if (typeof document === 'undefined') return '';
   const pattern = new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)');
   const match = document.cookie.match(pattern);
   return match ? decodeURIComponent(match[1]) : '';
};
// Consolidated auth token resolver: prioritise localStorage then readable cookies
const resolveAuthToken = (): { token: string; source: string; cookieJwt: string; cookieJwtFront: string; lsToken: string } => {
   const lsToken = localStorage.getItem('jwt') || localStorage.getItem('token') || localStorage.getItem('jwt_auth_token') || '';
   const cookieJwt = getCookieValue('jwt');
   const cookieJwtFront = getCookieValue('jwt_front');
   const token = lsToken || cookieJwtFront || cookieJwt;
   const source = lsToken ? 'localStorage' : (cookieJwtFront ? 'cookie:jwt_front' : (cookieJwt ? 'cookie:jwt' : 'none'));
   return { token, source, cookieJwt, cookieJwtFront, lsToken };
};

// Helper to fetch from Binance
const fetchBinanceData = async (symbol: string): Promise<ChartDataPoint[]> => {
  try {
    const cleanSymbol = symbol.replace('/', '');
    // Using 1h interval for general view
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=1h&limit=100`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        time: new Date(item[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    return [];
  }
};

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.LANDING); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Default collapsed for pro feel
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Mobile Trading Tab State
  const [mobileTradeTab, setMobileTradeTab] = useState<'chart' | 'book' | 'trade'>('chart');
  // Pair Selector State
  const [isPairSelectorOpen, setIsPairSelectorOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data State
  const [pairs, setPairs] = useState<MarketPair[]>(MOCK_PAIRS);
  const [selectedPair, setSelectedPair] = useState<MarketPair>(MOCK_PAIRS[0]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(INITIAL_CHART_DATA);
  const [assets, setAssets] = useState<PortfolioAsset[]>(INITIAL_ASSETS);
   // Balances fetched from backend /api/v1/balance/ (mapped by symbol)
   const [balancesMap, setBalancesMap] = useState<Record<string, { actual: number; orders: number }>>({});
   const [balancesLastUpdated, setBalancesLastUpdated] = useState<number | null>(null);
   // Portfolio balance fetched from /api/v1/portfolio-balance/?currency=USDT
   const [portfolioBalance, setPortfolioBalance] = useState<number>(0);
   const [portfolioBalanceLoading, setPortfolioBalanceLoading] = useState<boolean>(false);
  
  // Wallet System State (Lifted for persistence)
  const [walletAddresses, setWalletAddresses] = useState<Record<string, Record<string, string>>>({});
  
  // Trading State
  const [openOrders, setOpenOrders] = useState<Order[]>(MOCK_OPEN_ORDERS);
  const [orderHistory, setOrderHistory] = useState<Order[]>(MOCK_ORDER_HISTORY);

  // NFT Market State
  const [nftMode, setNftMode] = useState<'market' | 'mint'>('market');

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth Handlers - Memoized
  const handleLogin = useCallback((userProfile: UserProfile) => {
      setUser(userProfile);
      setIsAuthModalOpen(false);
      setView(AppView.DASHBOARD);
      
      // Set jwt cookie after successful login
      const token = localStorage.getItem('jwt') || localStorage.getItem('token') || localStorage.getItem('jwt_auth_token') || '';
      if (token && typeof document !== 'undefined') {
        document.cookie = `jwt=${token}; path=/; max-age=86400; SameSite=Lax`;
            try { localStorage.setItem('jwt', token); localStorage.setItem('token', token); } catch {}
      }

      // After successful login, fetch latest coins list and populate top markets
      (async () => {
         try {
            const domain = (import.meta as any)?.env?.VITE_API_DOMAIN || 'https://detidex.yeuthich.net';
            const endpoint = (import.meta as any)?.env?.VITE_COINS_API || '/api/v1/coins/';
            const url = `${String(domain).replace(/\/$/, '')}${endpoint}`;
            const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
            const data = await res.json().catch(() => ({}));

            // Prefer the explicit `coins` section in the API response.
            // The response can be either an array or an object: { coins: { SYMBOL: {...}, ... } }
            let coinsArray: any[] = [];
            if (Array.isArray(data)) {
               // Legacy: response is an array of coin objects
               coinsArray = data;
            } else if (data && typeof data === 'object' && data.coins) {
               if (Array.isArray(data.coins)) {
                  coinsArray = data.coins.map((c: any) => ({ ...(c as any), symbol: (c.code || c.symbol || c.name || '').toString().toUpperCase() }));
               } else if (data.coins && typeof data.coins === 'object') {
                  // Map object keyed by symbol: use the key as the symbol, or fall back to code within the value
                  coinsArray = Object.entries(data.coins).map(([sym, val]) => ({ ...(val as any), symbol: (val as any)?.code?.toString().toUpperCase() || sym.toString().toUpperCase() }));
               }
            } else {
               // No coins section: skip updating pairs. This avoids accidentally interpreting other top-level keys (e.g., pairs_data) as coins.
               // eslint-disable-next-line no-console
               console.warn('No `coins` section in coins API response; skipping coin mapping.');
            }

            if (coinsArray.length > 0) {
               const mapped: MarketPair[] = coinsArray.map((c: any) => {
                  const symbol = (c.symbol || c.ticker || c.id || '').toString().toUpperCase();
                  const rawPrice = c.price ?? c.price_usd ?? c.last_price ?? 0;
                  const priceVal = Number(rawPrice) || 0;
                  try {
                    // eslint-disable-next-line no-console
                    console.debug('Coins mapping', { symbol, rawPrice, priceVal, source: Object.keys(c).filter(k => /price/i.test(k)) });
                  } catch (e) {}
                  return {
                     symbol,
                     base: symbol || 'UNKNOWN',
                     name: c.name || c.title || (typeof c.code === 'string' ? c.code : symbol) || symbol,
                     quote: 'USDT', // keep USDT visible as the quote
                     price: priceVal,
                     change24h: Number(c.change_24h ?? c.percent_change_24h ?? c.price_change_percentage_24h ?? 0) || 0,
                     volume24h: Number(c.volume_24h ?? c.volume ?? c.quote_volume ?? 0) || 0,
                     marketCap: Number(c.market_cap ?? c.marketCap ?? c.volume_24h ?? c.volume ?? 0) || 0,
                     high24h: Number(c.high_24h ?? c.high ?? 0) || 0,
                     low24h: Number(c.low_24h ?? c.low ?? 0) || 0,
                  } as MarketPair;
               });

               // Default sort: by volume (treat marketCap as mapped from volume if needed)
               mapped.sort((a, b) => (b.volume24h || b.marketCap || 0) - (a.volume24h || a.marketCap || 0));
               // Debug: inspect mapped results to ensure base is mapped correctly (temporary)
               try {
                  // eslint-disable-next-line no-console
                  console.debug('Mapped coins (top 10):', mapped.slice(0, 10));
                  const wrongBases = mapped.filter(m => (m.base || '').toUpperCase() === 'USDT');
                  if (wrongBases.length > 0) {
                     // eslint-disable-next-line no-console
                     console.warn('Found pairs with base incorrectly set to USDT:', wrongBases.map(x => x.symbol));
                  }
               } catch (e) {}
               setPairs(mapped);
               setSelectedPair(prev => mapped.find(p => p.symbol === prev.symbol) || mapped[0] || prev);
            }
         } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed to fetch coins after login', err);
         }
      })();
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setView(AppView.LANDING);
    setWalletAddresses({}); 
  }, []);

  const handleKYCUpdate = useCallback((status: UserProfile['kycStatus']) => {
    setUser(prev => prev ? ({ ...prev, kycStatus: status }) : null);
  }, []);

  const requireAuth = useCallback((view: AppView) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setView(view);
    }
  }, [user]);

  const handleLoginClick = useCallback(() => setIsAuthModalOpen(true), []);
  const handleKYCClick = useCallback(() => setView(AppView.KYC), []);
  const handleToggleCollapse = useCallback(() => setIsSidebarCollapsed(prev => !prev), []);

  // Real Data Fetching Effect (Binance API)
  useEffect(() => {
    const loadRealData = async () => {
      if (selectedPair.base !== 'DETI') {
        const realData = await fetchBinanceData(selectedPair.symbol);
        if (realData.length > 0) {
          setChartData(realData);
        }
      } else {
        // Reset to mock data for DETI
        // Only set if we haven't already (to preserve ongoing simulation)
        setChartData(prev => {
           // If previous data looks like real API data (different length/structure) or is empty, reset to INITIAL
           return prev.length === 0 ? INITIAL_CHART_DATA : prev;
        });
      }
    };

    loadRealData();
    const poll = setInterval(loadRealData, 60000); // Poll every minute
    return () => clearInterval(poll);
  }, [selectedPair.symbol, selectedPair.base]);

  // Simulation Loop (Ticker Price + DETI Chart)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate Price Ticker for all pairs (gives the UI a "live" feel)
      setPairs(prevPairs => prevPairs.map(p => {
        const volatility = 0.0005; // Low volatility for stable coins
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        return { 
          ...p, 
          price: p.price * change,
          change24h: p.change24h + (Math.random() * 0.02 - 0.01)
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Separate effect for DETI chart simulation to keep it smooth
  useEffect(() => {
    if (selectedPair.base !== 'DETI') return;

    const interval = setInterval(() => {
        setChartData(prevData => {
          if (prevData.length === 0) return INITIAL_CHART_DATA;
          const lastCandle = prevData[prevData.length - 1];
          const volatility = lastCandle.close * 0.002;
          const change = (Math.random() - 0.5) * volatility;
          const newClose = lastCandle.close + change;
          const updatedCandle = {
             ...lastCandle,
             close: newClose,
             high: Math.max(lastCandle.high, newClose),
             low: Math.min(lastCandle.low, newClose),
             volume: lastCandle.volume + Math.floor(Math.random() * 100)
          };
          const newData = [...prevData];
          newData[newData.length - 1] = updatedCandle;
          return newData;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedPair.base]);

  // Sync selectedPair state with the updated pairs list to show live price in header
  // Memoize this derived value to prevent unnecessary object creation
  const liveSelectedPair = useMemo(() => 
    pairs.find(p => p.symbol === selectedPair.symbol) || selectedPair, 
  [pairs, selectedPair]);

  // Actions - Memoized
  const handleNavigateToTrade = useCallback((pair: MarketPair) => {
    setSelectedPair(pair);
    setView(AppView.TRADING);
  }, []);

   // Fix REason: Fetch balances only when navigating to WALLET, not on every pairs update
   useEffect(() => {
      if (currentView !== AppView.WALLET) return;
      let mounted = true;
      const fetchBalances = async () => {
         try {
            const domainEnv = (import.meta as any)?.env?.VITE_API_DOMAIN || 'https://detidex.yeuthich.net';
            const isLocalHost = typeof window !== 'undefined' && /localhost:300[01]/.test(window.location.host);
            const apiBase = isLocalHost ? '' : String(domainEnv).replace(/\/$/, '');
            const url = `${apiBase}/api/v1/balance/`;
                  const { token, source, cookieJwt, cookieJwtFront, lsToken } = resolveAuthToken();
                  if (!token) {
                      console.warn('Skipping balance fetch: no auth token found', {
                         cookieJwtMasked: maskToken(cookieJwt),
                         cookieJwtFrontMasked: maskToken(cookieJwtFront),
                         lsTokenMasked: maskToken(lsToken)
                      });
                      return;
                  }
            const headers: Record<string, string> = {
              'Accept': 'application/json, text/plain, */*',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'en-US,en;q=0.9'
            };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
                  if (isDebug) {
                     console.debug('[Balances] Request debug', {
                        url,
                        headers,
                        tokenMasked: maskToken(token),
                        source,
                        cookieJwt: maskToken(cookieJwt),
                        cookieJwtFront: maskToken(cookieJwtFront),
                        lsToken: maskToken(lsToken)
                     });
                  }
            const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
            if (!mounted) return;
            if (!res.ok) return;
            const data = await res.json();
            const normalized = (data && (data.balance || data.balances)) ? (data.balance || data.balances) : data;
            setBalancesMap(normalized || {});
            setBalancesLastUpdated(Date.now());
         } catch (err) {
            console.warn('Failed to fetch balances', err);
         }
      };
      fetchBalances();
      return () => { mounted = false; };
   }, [currentView]);

   // Fetch portfolio balance (sum of actual_usd > 0) from /api/v1/portfolio-balance/?currency=USDT
   useEffect(() => {
      if (currentView !== AppView.DASHBOARD) return;
      let mounted = true;
      const fetchPortfolioBalance = async () => {
         try {
            setPortfolioBalanceLoading(true);
            const domainEnv = (import.meta as any)?.env?.VITE_API_DOMAIN || 'https://detidex.yeuthich.net';
            const isLocalHost = typeof window !== 'undefined' && /localhost:300[01]/.test(window.location.host);
            const apiBase = isLocalHost ? '' : String(domainEnv).replace(/\/$/, '');
            const url = `${apiBase}/api/v1/portfolio-balance/?currency=USDT`;
            const { token, source, cookieJwt, cookieJwtFront, lsToken } = resolveAuthToken();
            if (!token) {
               console.warn('Skipping portfolio balance fetch: no auth token found', {
                  cookieJwtMasked: maskToken(cookieJwt),
                  cookieJwtFrontMasked: maskToken(cookieJwtFront),
                  lsTokenMasked: maskToken(lsToken)
               });
               setPortfolioBalanceLoading(false);
               return;
            }

            const headers: Record<string, string> = {
              'Accept': 'application/json, text/plain, */*',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'en-US,en;q=0.9'
            };
            headers['Authorization'] = `Bearer ${token}`;

            if (isDebug) {
               console.debug('[PortfolioBalance] Request debug', {
                  url,
                  headers,
                  tokenMasked: maskToken(token),
                  source,
                  cookieJwt: maskToken(cookieJwt),
                  cookieJwtFront: maskToken(cookieJwtFront),
                  lsToken: maskToken(lsToken)
               });
            }

            const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
            if (!mounted) return;
            if (!res.ok) {
               setPortfolioBalanceLoading(false);
               return;
            }
            const data = await res.json();
            const payload = (data && (data.balance || data.balances)) ? (data.balance || data.balances) : data;
            const items = Array.isArray(payload) ? payload : Object.values(payload || {});
            const total = items.reduce((sum: number, item: any) => {
               const value = Number(item?.actual_usd ?? item?.actualUSD ?? item?.actual_usdt ?? item);
               return value > 0 ? sum + value : sum;
            }, 0);
            setPortfolioBalance(total);
            setPortfolioBalanceLoading(false);
         } catch (err) {
            console.warn('Failed to fetch portfolio balance', err);
            setPortfolioBalanceLoading(false);
         }
      };

      fetchPortfolioBalance();
      return () => { mounted = false; };
   }, [currentView, user]);

   // Recalculate asset prices when balances or pairs change
   useEffect(() => {
      if (!balancesMap || Object.keys(balancesMap).length === 0) return;
      const mappedAssets: PortfolioAsset[] = Object.entries(balancesMap)
         .filter(([sym, val]: any) => {
            const actual = Number(val?.actual) || 0;
            const orders = Number(val?.orders) || 0;
            return (actual + orders) > 0;
         })
         .map(([sym, val]: any) => {
            const symbol = sym;
            const actual = Number(val?.actual) || 0;
            const orders = Number(val?.orders) || 0;
            const pairMatch = pairs.find(p => p.base === symbol) || pairs.find(p => p.symbol.startsWith(symbol + '/'));
            const price = pairMatch ? Number(pairMatch.price) : 0;
            const existing = assets.find(a => a.symbol === symbol);
            return {
               symbol,
               name: existing?.name || symbol,
               amount: actual + orders,
               valueUsd: (actual + orders) * price,
               color: existing?.color || '#374151'
            } as PortfolioAsset;
         });
      setAssets(mappedAssets);
   }, [balancesMap, pairs]);

   // Expose refresh function to pass to Wallet
   const refreshBalances = useCallback(() => {
      // trigger the effect by calling fetch inside (duplicate logic kept minimal)
      (async () => {
         try {
            const domainEnv = (import.meta as any)?.env?.VITE_API_DOMAIN || 'https://detidex.yeuthich.net';
            const isLocalHost = typeof window !== 'undefined' && /localhost:300[01]/.test(window.location.host);
            const apiBase = isLocalHost ? '' : String(domainEnv).replace(/\/$/, '');
            const url = `${apiBase}/api/v1/balance/`;
                  const { token, source, cookieJwt, cookieJwtFront, lsToken } = resolveAuthToken();
                  if (!token) {
                      console.warn('Skipping balance refresh: no auth token found', {
                         cookieJwtMasked: maskToken(cookieJwt),
                         cookieJwtFrontMasked: maskToken(cookieJwtFront),
                         lsTokenMasked: maskToken(lsToken)
                      });
                      return;
                  }
            const headers: Record<string, string> = {
              'Accept': 'application/json, text/plain, */*',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'en-US,en;q=0.9'
            };
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
                  if (isDebug) {
                     console.debug('[Balances] Refresh debug', {
                        url,
                        headers,
                        tokenMasked: maskToken(token),
                        source,
                        cookieJwt: maskToken(cookieJwt),
                        cookieJwtFront: maskToken(cookieJwtFront),
                        lsToken: maskToken(lsToken)
                     });
                  }
            const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();
            const normalized = (data && (data.balance || data.balances)) ? (data.balance || data.balances) : data;
            setBalancesMap(normalized || {});
            setBalancesLastUpdated(Date.now());
            const mappedAssets: PortfolioAsset[] = Object.entries(normalized || {})
               .filter(([sym, val]: any) => {
                  const actual = Number(val?.actual) || 0;
                  const orders = Number(val?.orders) || 0;
                  return (actual + orders) > 0;
               })
               .map(([sym, val]: any) => {
                  const symbol = sym;
                  const actual = Number(val?.actual) || 0;
                  const orders = Number(val?.orders) || 0;
                  const pairMatch = pairs.find(p => p.base === symbol) || pairs.find(p => p.symbol.startsWith(symbol + '/'));
                  const price = pairMatch ? Number(pairMatch.price) : 0;
                  const existing = assets.find(a => a.symbol === symbol);
                  return {
                     symbol,
                     name: existing?.name || symbol,
                     amount: actual + orders,
                     valueUsd: (actual + orders) * price,
                     color: existing?.color || '#374151'
                  } as PortfolioAsset;
               });
            setAssets(mappedAssets);
         } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed to refresh balances', err);
         }
      })();
   }, [pairs, assets]);

  const handleFastSwap = useCallback((from: string, to: string, amount: number) => {
     if (!user) {
        setIsAuthModalOpen(true);
        return;
     }
     setAssets(prevAssets => {
        const fromAssetIndex = prevAssets.findIndex(a => a.symbol === from);
        const toAssetIndex = prevAssets.findIndex(a => a.symbol === to);

        if (fromAssetIndex === -1) {
          alert('Insufficient balance');
          return prevAssets;
        }

        const newAssets = [...prevAssets];
        const currentFromAsset = newAssets[fromAssetIndex];
        
        newAssets[fromAssetIndex] = {
          ...currentFromAsset,
          amount: currentFromAsset.amount - amount,
          valueUsd: (currentFromAsset.amount - amount) * (currentFromAsset.valueUsd / currentFromAsset.amount)
        };
        
        return newAssets;
     });
  }, [user]);

  const handleWalletWithdraw = useCallback((symbol: string, amount: number) => {
    if (!user) return setIsAuthModalOpen(true);
    console.log(`Processing withdrawal: ${amount} ${symbol} for user ${user.id}`);
  }, [user]);

  const handleWalletDeposit = useCallback((symbol: string, amount: number) => {
    if (!user) return setIsAuthModalOpen(true);
    setAssets(prev => prev.map(a => {
      if (a.symbol === symbol) {
        const newAmount = a.amount + amount;
        const pricePerUnit = a.amount > 0 ? a.valueUsd / a.amount : (symbol === 'USDT' ? 1 : 100); 
        return {
          ...a,
          amount: newAmount,
          valueUsd: newAmount * pricePerUnit
        };
      }
      return a;
    }));
  }, [user]);

  const handleGenerateAddressClick = useCallback((symbol: string, networkId: string, standard: string) => {
      const newAddress = generateMockAddress(symbol, standard);
      setWalletAddresses(prev => ({
          ...prev,
          [symbol]: {
              ...(prev[symbol] || {}),
              [networkId]: newAddress
          }
      }));
  }, []);

  const handlePlaceOrder = useCallback((newOrder: Partial<Order>) => {
    if (!user) return setIsAuthModalOpen(true);

    const order: Order = {
      id: `ORD-${Date.now()}`,
      pair: selectedPair.symbol, // This uses closure capture of selectedPair, which is fine if we update dependency
      type: newOrder.type || 'Limit',
      side: newOrder.side || 'Buy',
      price: newOrder.price || selectedPair.price,
      amount: newOrder.amount || 0,
      filled: 0,
      total: newOrder.total || 0,
      status: 'Open',
      date: new Date().toLocaleTimeString(),
      triggerPrice: newOrder.triggerPrice
    };

    if (order.type === 'Market') {
       order.status = 'Filled';
       order.filled = order.amount;
       setOrderHistory(prev => [order, ...prev]);
    } else {
       setOpenOrders(prev => [order, ...prev]);
    }
  }, [user, selectedPair]); // Updates when selectedPair changes, which is infrequent compared to ticks

  const handleCancelOrder = useCallback((id: string) => {
     setOpenOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const marketContext = useMemo(() => `
    Current View: ${currentView}
    Selected Pair: ${selectedPair.symbol} ($${selectedPair.price.toFixed(2)})
  `, [currentView, selectedPair.symbol, selectedPair.price]);

  if (currentView === AppView.LANDING) {
    return (
      <>
        <LandingHero 
           setView={requireAuth} 
           isDarkMode={isDarkMode} 
           toggleTheme={toggleTheme} 
        />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={handleLogin} 
        />
      </>
    );
  }

  // Determine view states for layout logic
  const isTradingView = currentView === AppView.TRADING;
  const isMarketsView = currentView === AppView.MARKETS;
  // Determine if sidebar should be collapsed (trading or markets)
  const isCollapsedView = isTradingView || isMarketsView;
  // Immersive mode hides standard top bars and adjusts padding
  const isImmersiveMode = isTradingView || isMarketsView;

  return (
    <div className={`h-screen w-full flex bg-deti-bg text-deti-text font-sans overflow-hidden transition-colors duration-300 relative selection:bg-deti-primary/30`}>
      
      {/* GLOBAL IMMERSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Noise Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
          {/* Ambient Orbs - Always visible now to maintain branding */}
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-deti-primary/5 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-deti-secondary/5 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)"></div>
      </div>

      <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={handleLogin} 
      />

      {/* Desktop Sidebar - Hidden on mobile in Immersive Mode */}
      <div className={`${isImmersiveMode ? 'hidden lg:block' : 'block'}`}>
        <Sidebar 
          currentView={currentView} 
          setView={requireAuth} 
          isCollapsed={isSidebarCollapsed || isCollapsedView}
          toggleCollapse={handleToggleCollapse}
          isLoggedIn={!!user}
          onLogout={handleLogout}
        />
      </div>
      
      {/* Main Content Layout */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 z-10 ${
          // If Sidebar is hidden (mobile immersive), remove margin. Else follow collapsed state
          (isImmersiveMode) 
             ? 'lg:ml-20' // On Desktop immersive, sidebar is collapsed (20). On mobile, sidebar hidden (0 margin handled by flex)
             : (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')
        } ${isImmersiveMode ? 'ml-0' : ''}`} // Reset mobile margin for immersive
      >
        {/* Hide TopBar for immersive modules (Trading & Markets) */}
        {!isImmersiveMode && (
          <TopBar 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            user={user}
            onLoginClick={handleLoginClick}
            onKYCClick={handleKYCClick}
                  onLogout={handleLogout}
                  onHomeClick={() => setView(AppView.DASHBOARD)}
          />
        )}
        
        {/* Viewport Content Area */}
        {/* Adjusted padding for Immersive Mode: Remove bottom padding on desktop, maybe keep on mobile depending on nav */}
        <main className={`flex-1 relative overflow-hidden ${!isImmersiveMode ? 'pb-[80px] lg:pb-0' : ''}`}>
           
           <div className={`relative z-10 h-full ${!isImmersiveMode ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
              
              {currentView === AppView.DASHBOARD && (
                <Dashboard 
                   assets={assets} 
                   pairs={pairs}
                   onNavigateToTrade={handleNavigateToTrade}
                   onFastSwap={handleFastSwap}
                   isDarkMode={isDarkMode}
                   walletAddresses={walletAddresses}
                   onGenerateAddress={handleGenerateAddressClick}
                   onWithdraw={handleWalletWithdraw}
                   onDeposit={handleWalletDeposit}
                   portfolioBalance={portfolioBalance}
                   portfolioBalanceLoading={portfolioBalanceLoading}
                />
              )}

              {currentView === AppView.MARKETS && (
                 <MarketOverview 
                    setView={setView} 
                    onNavigateToTrade={handleNavigateToTrade} 
                 />
              )}

              {currentView === AppView.ORDERS && (
                 <div className="h-full overflow-y-auto custom-scrollbar bg-deti-bg/60">
                    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
                       <div className="flex items-center justify-between">
                          <div>
                             <h2 className="text-2xl font-bold text-white">Orders</h2>
                             <p className="text-deti-subtext text-sm">Manage open and historical orders</p>
                          </div>
                       </div>
                       <div className="bg-deti-card/70 border border-deti-border rounded-2xl overflow-hidden shadow-card">
                          <OrderManagement 
                             openOrders={openOrders} 
                             orderHistory={orderHistory} 
                             onCancelOrder={handleCancelOrder}
                          />
                       </div>
                    </div>
                 </div>
              )}

              {/* PROFESSIONAL TRADING INTERFACE */}
                     {currentView === AppView.TRADING && (
                <div className="h-full flex flex-col bg-deti-bg/90 backdrop-blur-md text-deti-text">
                  
                  {/* PRO TRADING HEADER */}
                  <div className="h-12 border-b border-deti-border flex items-center px-4 justify-between bg-deti-card/80 shrink-0 relative z-50">
                     <div className="flex items-center gap-6">
                        
                        {/* Mobile Back Button */}
                        <button 
                           onClick={() => setView(AppView.DASHBOARD)}
                           className="lg:hidden p-2 -ml-2 text-deti-subtext hover:text-white"
                        >
                           <ChevronLeft size={20} />
                        </button>

                        {/* Pair Selector Button */}
                        <div className="relative">
                           <div 
                              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 py-1 px-2 rounded transition-colors group relative border border-transparent hover:border-deti-primary/20" 
                              onClick={() => setIsPairSelectorOpen(!isPairSelectorOpen)}
                           >
                              <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white shadow-glow">
                                 {liveSelectedPair.base[0]}
                              </div>
                              <h2 className="text-sm font-bold text-deti-text group-hover:text-deti-primary transition-colors">{liveSelectedPair.symbol}</h2>
                              <span className="text-[10px] bg-deti-surface px-1 rounded text-deti-subtext border border-white/5">10x</span>
                              <ChevronDown size={14} className={`text-deti-subtext transition-transform ${isPairSelectorOpen ? 'rotate-180' : ''}`} />
                           </div>

                           {/* PAIR SELECTOR DROPDOWN */}
                           {isPairSelectorOpen && (
                              <div className="absolute top-full left-0 mt-2 w-72 bg-deti-card border border-deti-primary/30 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-top-left brand-lighting-box z-[100]">
                                 <div className="p-2 border-b border-white/10">
                                    <div className="relative">
                                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-deti-subtext" />
                                       <input autoFocus placeholder="Search" className="w-full bg-deti-surface text-xs text-deti-text pl-8 pr-2 py-2 rounded-lg border border-white/10 outline-none focus:border-deti-primary/50" />
                                    </div>
                                 </div>
                                 <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    <div className="flex text-[10px] text-deti-subtext font-bold px-3 py-2 bg-deti-surface">
                                       <span className="flex-1">Pair</span>
                                       <span className="flex-1 text-right">Price</span>
                                    </div>
                                    {pairs.map(p => (
                                       <div 
                                          key={p.symbol}
                                          onClick={() => { setSelectedPair(p); setIsPairSelectorOpen(false); }}
                                          className={`flex items-center px-3 py-2.5 cursor-pointer hover:bg-white/5 border-l-2 ${liveSelectedPair.symbol === p.symbol ? 'border-deti-primary bg-white/5' : 'border-transparent'}`}
                                       >
                                          <div className="flex-1 flex items-center gap-2">
                                             <Star size={10} className="text-deti-subtext hover:text-deti-primary" />
                                             <span className={`text-xs font-bold ${liveSelectedPair.symbol === p.symbol ? 'text-deti-primary' : 'text-deti-text'}`}>{p.symbol}</span>
                                          </div>
                                          <div className="flex-1 text-right text-xs font-mono text-deti-text">
                                             {p.price.toFixed(2)}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Ticker Stats */}
                        <div className="flex gap-6 text-xs">
                           <div className="flex flex-col">
                              <span className={`font-mono text-sm font-bold ${liveSelectedPair.change24h >= 0 ? 'text-deti-success' : 'text-deti-danger'}`}>
                                 {liveSelectedPair.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-deti-subtext text-[10px]">Last Price</span>
                           </div>
                           <div className="hidden md:flex flex-col">
                              <span className="font-mono text-deti-text">{(liveSelectedPair.price * 0.999).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              <span className="text-deti-subtext text-[10px]">Index Price</span>
                           </div>
                           <div className="hidden md:flex flex-col">
                              <span className={`font-mono ${liveSelectedPair.change24h >= 0 ? 'text-deti-success' : 'text-deti-danger'}`}>
                                 {liveSelectedPair.change24h > 0 ? '+' : ''}{liveSelectedPair.change24h.toFixed(2)}%
                              </span>
                              <span className="text-deti-subtext text-[10px]">24h Change</span>
                           </div>
                           <div className="hidden lg:flex flex-col">
                              <span className="font-mono text-deti-text">{(liveSelectedPair.volume24h / 1000000).toFixed(2)}M</span>
                              <span className="text-deti-subtext text-[10px]">24h Volume</span>
                           </div>
                        </div>
                     </div>

                     {/* Right Controls */}
                     <div className="flex items-center gap-3">
                        <button className="hidden lg:flex items-center gap-1 text-xs text-deti-primary hover:text-white bg-deti-primary/10 hover:bg-deti-primary/20 px-3 py-1.5 rounded border border-deti-primary/20 transition-all">
                           Advanced (customized) <ChevronDown size={12} />
                        </button>
                        <button 
                           onClick={() => setView(AppView.KYC)}
                           className="bg-gradient-brand hover:brightness-110 text-white text-xs font-bold px-4 py-1.5 rounded shadow-glow transition-all hidden sm:block"
                        >
                           Verify
                        </button>
                        <div className="h-6 w-[1px] bg-deti-border mx-1 hidden sm:block"></div>
                        <button className="text-deti-subtext hover:text-deti-primary p-1 transition-colors hidden sm:block"><Settings size={16} /></button>
                        <button className="text-deti-subtext hover:text-deti-primary p-1 transition-colors"><Bell size={16} /></button>
                        <button onClick={() => setView(AppView.DASHBOARD)} className="text-deti-subtext hover:text-deti-primary p-1 transition-colors" title="Exit Pro Mode"><Monitor size={16} /></button>
                     </div>
                  </div>

                  {/* PRO GRID LAYOUT */}
                  {/* Clicking backdrop to close pair selector if open */}
                  <div className="flex-1 flex overflow-hidden" onClick={() => isPairSelectorOpen && setIsPairSelectorOpen(false)}>
                      
                      {/* Left Column (Chart + History) */}
                      {/* Responsive Logic: Full width on mobile if selected tab, otherwise standard desktop layout */}
                      <div className={`flex-col min-w-0 border-r border-deti-border transition-all ${mobileTradeTab === 'chart' ? 'flex flex-1 w-full' : 'hidden lg:flex lg:flex-1'}`}>
                          {/* Chart Area */}
                          <div className="flex-[3] relative flex flex-col min-h-0 bg-deti-bg/50 border-b border-deti-border">
                             <div className="flex items-center px-2 py-1 border-b border-deti-border gap-1 bg-deti-card/80">
                                <button className="px-3 py-1 text-xs font-bold text-deti-primary bg-deti-bg border-t-2 border-deti-primary rounded-t-sm">Market chart</button>
                                <button className="px-3 py-1 text-xs font-medium text-deti-subtext hover:text-white">Favorites</button>
                             </div>
                             <div className="flex-1 relative">
                                                {/* Fix REason: Wrap TradingChart with ErrorBoundary to avoid whole-app crashes if chart fetch/render fails */}
                                                <ErrorBoundary>
                                                   <TradingChart data={chartData} symbol={liveSelectedPair.symbol} isDarkMode={true} />
                                                </ErrorBoundary>
                             </div>
                          </div>
                          {/* Bottom Panel (History) */}
                          <div className="flex-[2] min-h-0 bg-deti-bg/50">
                             <OrderManagement 
                                openOrders={openOrders} 
                                orderHistory={orderHistory} 
                                onCancelOrder={handleCancelOrder}
                             />
                          </div>
                      </div>

                      {/* Middle Column (Order Book) */}
                      <div className={`flex-col border-r border-deti-border bg-deti-bg/80 transition-all ${mobileTradeTab === 'book' ? 'flex w-full flex-1' : 'hidden lg:flex lg:w-[280px]'}`}>
                          <OrderBook currentPrice={liveSelectedPair.price} />
                      </div>

                      {/* Right Column (Order Form) */}
                      <div className={`flex-col bg-deti-bg/80 transition-all ${mobileTradeTab === 'trade' ? 'flex w-full flex-1' : 'hidden md:flex md:w-[300px]'}`}>
                          <BuySellPanel 
                             currentPrice={liveSelectedPair.price} 
                             pair={liveSelectedPair.symbol} 
                             onPlaceOrder={handlePlaceOrder} 
                          />
                      </div>
                  </div>
                  
                  {/* Ticker Footer */}
                  <div className="shrink-0 z-40 border-t border-deti-border bg-deti-card">
                     <MarketTicker pairs={pairs} />
                  </div>

                  {/* Mobile Tabs */}
                  <div className="lg:hidden flex border-t border-deti-border bg-deti-card">
                     <button onClick={() => setMobileTradeTab('chart')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 ${mobileTradeTab === 'chart' ? 'text-deti-primary' : 'text-deti-subtext'}`}>
                        <CandlestickChart size={16} /> Chart
                     </button>
                     <button onClick={() => setMobileTradeTab('book')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 ${mobileTradeTab === 'book' ? 'text-deti-primary' : 'text-deti-subtext'}`}>
                        <List size={16} /> Book
                     </button>
                     <button onClick={() => setMobileTradeTab('trade')} className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 ${mobileTradeTab === 'trade' ? 'text-deti-primary' : 'text-deti-subtext'}`}>
                        <ArrowLeftRight size={16} /> Trade
                     </button>
                  </div>
                </div>
              )}

              {currentView === AppView.WALLET && (
                 <div className="h-full overflow-y-auto">
                    {/* Fix REason: Isolate wallet render with ErrorBoundary so a wallet-specific failure doesn't crash the whole app */}
                    <ErrorBoundary>
                      <Wallet 
                         assets={assets} 
                         walletAddresses={walletAddresses}
                         balancesMap={balancesMap}
                         onRefreshBalances={refreshBalances}
                         balancesLastUpdated={balancesLastUpdated}
                         onGenerateAddress={handleGenerateAddressClick}
                         onWithdraw={handleWalletWithdraw}
                         onDeposit={handleWalletDeposit}
                      />
                    </ErrorBoundary>
                 </div>
              )}

              {currentView === AppView.SWAP && (
                 <div className="h-full">
                    <QuickSwap assets={assets} pairs={pairs} onSwap={handleFastSwap} />
                 </div>
              )}

              {currentView === AppView.FEES && (
                 <div className="h-full overflow-y-auto custom-scrollbar">
                    <Fees />
                 </div>
              )}

              {currentView === AppView.KYC && user && (
                 <div className="h-full overflow-y-auto custom-scrollbar">
                    <KYC user={user} onUpdateStatus={handleKYCUpdate} />
                 </div>
              )}

              {currentView === AppView.NFT && (
                 <div className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-8">
                     {nftMode === 'mint' ? (
                       <MintRWA onBack={() => setNftMode('market')} />
                     ) : (
                       <div className="max-w-7xl mx-auto space-y-6">
                          <div className="flex justify-between items-center">
                             <h2 className="text-3xl font-bold text-deti-text">RWA Marketplace</h2>
                             <button onClick={() => setNftMode('mint')} className="bg-gradient-brand text-white px-4 py-2 rounded-xl font-bold shadow-glow flex items-center gap-2 hover:brightness-110 transition-all">
                                <Plus size={18} /> Tokenize Asset
                             </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             {[1, 2, 3, 4].map(i => (
                               <div key={i} className="bg-deti-card border border-deti-border rounded-2xl overflow-hidden hover:-translate-y-1 transition-all shadow-lg group cursor-pointer" onClick={() => setNftMode('mint')}>
                                  <div className="h-48 bg-deti-surface relative">
                                     <div className="absolute inset-0 flex items-center justify-center text-deti-subtext opacity-30"><LayoutGrid size={40} /></div>
                                     <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase">Real Estate</div>
                                  </div>
                                  <div className="p-4">
                                     <h3 className="font-bold text-white">Luxury Villa #{i}</h3>
                                     <div className="flex justify-between mt-2 text-xs text-deti-subtext">
                                        <span>Min Invest: $500</span>
                                        <span className="text-deti-success">APY: 8.5%</span>
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                     )}
                 </div>
              )}

              {currentView === AppView.SETTINGS && (
                 <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6 h-full overflow-y-auto">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-semibold tracking-tighter mb-2 text-deti-text">Account & More</h2>
                        <p className="text-deti-subtext">Manage settings and access other features.</p>
                      </div>
                      {/* Mobile Logout Button */}
                      {user && (
                        <button onClick={handleLogout} className="lg:hidden p-2 bg-deti-card border border-deti-border rounded-xl text-deti-danger">
                           <LogOut size={20} />
                        </button>
                      )}
                    </div>

                    {/* Mobile Navigation Grid (Modules missing from BottomNav) */}
                    <div className="lg:hidden grid grid-cols-2 gap-4">
                       {[
                          { id: AppView.MARKETS, label: 'Markets', icon: BarChart2, color: 'text-blue-400' },
                          { id: AppView.FEES, label: 'Fees & VIP', icon: Percent, color: 'text-yellow-400' },
                          { id: AppView.KYC, label: 'Verification', icon: ShieldCheck, color: 'text-green-400' },
                       ].map((item) => (
                          <button 
                             key={item.id}
                             onClick={() => setView(item.id)}
                             className="flex flex-col items-center justify-center p-4 bg-deti-card border border-deti-border rounded-2xl active:scale-95 transition-all"
                          >
                             <div className={`p-3 rounded-full bg-white/5 mb-2 ${item.color}`}>
                                <item.icon size={24} />
                             </div>
                             <span className="text-xs font-bold text-deti-text">{item.label}</span>
                          </button>
                       ))}
                    </div>

                    {/* Settings Content */}
                    <div className="bg-deti-card/60 backdrop-blur-md rounded-2xl p-6 border border-deti-border space-y-4 brand-lighting-box">
                       <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings size={18} /> Preferences</h3>
                       <div className="flex items-center justify-between py-2 border-b border-deti-border/50">
                         <span className="text-deti-text font-medium text-sm">Dark Mode</span>
                         <button 
                           onClick={toggleTheme}
                           className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-deti-primary' : 'bg-deti-border'}`}
                         >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                         </button>
                       </div>
                       <div className="flex items-center justify-between py-2">
                         <span className="text-deti-text font-medium text-sm">Notifications</span>
                         <div className="flex items-center gap-2">
                            <span className="text-xs text-deti-subtext">Push Only</span>
                            <ChevronDown size={14} className="text-deti-subtext" />
                         </div>
                       </div>
                       <div className="pt-4 mt-2">
                          <button className="w-full py-3 bg-deti-primary text-white rounded-xl font-bold shadow-glow text-sm">Save Changes</button>
                       </div>
                    </div>

                    {/* User Info Card (Mobile Visible) */}
                    {user && (
                       <div className="bg-deti-card/60 backdrop-blur-md rounded-2xl p-6 border border-deti-border space-y-4 brand-lighting-box">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2"><UserIcon size={18} /> Profile</h3>
                          <div className="flex items-center gap-4">
                             <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-deti-primary" />
                             <div>
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-xs text-deti-subtext">{user.email || user.phone}</div>
                             </div>
                             <div className="ml-auto">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${user.kycStatus === 'Verified' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
                                   {user.kycStatus}
                                </span>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation (Visible only on < lg and not in Trading View) */}
      {!isTradingView && <BottomNav currentView={currentView} setView={requireAuth} />}

      {/* Global AI Assistant */}
      <AIAdvisor contextData={marketContext} />
    </div>
  );
};

export default App;