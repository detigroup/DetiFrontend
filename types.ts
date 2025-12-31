
export enum AppView {
  LANDING = 'LANDING',
  MARKETS = 'MARKETS',
  TRADING = 'TRADING',
  DASHBOARD = 'DASHBOARD',
  WALLET = 'WALLET',
  SWAP = 'SWAP',
  FEES = 'FEES',
  SETTINGS = 'SETTINGS',
  KYC = 'KYC',
  NFT = 'NFT'
}

export interface MarketPair {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
  sparkline?: number[]; // Mock sparkline data
  category?: string; // Added for Market Overview
  marketCap?: number; // Added for Market Overview
  name?: string; // Friendly display name for the base asset
}

export interface Order {
  id: string;
  pair: string;
  type: 'Limit' | 'Market' | 'Stop Limit';
  side: 'Buy' | 'Sell';
  price: number;
  amount: number;
  filled: number;
  total: number;
  triggerPrice?: number;
  status: 'Open' | 'Filled' | 'Canceled';
  date: string;
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  valueUsd: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Trade';
  asset: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
  network?: string;
  address?: string;
}

export interface CryptoNetwork {
  id: string;
  name: string;
  standard: string; // e.g., ERC20, TRC20
  fee: number;
  arrivalTime: string;
  minWithdraw: number;
}

export interface FeeTier {
  level: number;
  volumeReq: string;
  maker: string;
  taker: string;
  withdrawalLimit: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  kycStatus: 'Unverified' | 'Pending' | 'Verified' | 'Rejected';
  tier: number;
}
