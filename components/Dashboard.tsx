import React, { useState } from 'react';
import { MarketPair, PortfolioAsset, CryptoNetwork } from '../types';
import { COIN_NETWORKS } from '../constants';
import { 
   ArrowUpRight, MoreHorizontal, ArrowRightLeft, CreditCard, Wallet, RefreshCw,
   ArrowDownLeft, X, ChevronDown, CheckCircle2, Copy, AlertCircle, RefreshCcw, Server, ShieldCheck, Plus, Lock, QrCode
} from 'lucide-react';

interface DashboardProps {
  assets: PortfolioAsset[];
  pairs: MarketPair[];
  onNavigateToTrade: (pair: MarketPair) => void;
  onFastSwap: (from: string, to: string, amount: number) => void;
  isDarkMode?: boolean;
  walletAddresses: Record<string, Record<string, string>>;
  onGenerateAddress: (symbol: string, networkId: string, standard: string) => void;
  onWithdraw: (symbol: string, amount: number) => void;
  onDeposit: (symbol: string, amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({ 
  assets, pairs, onNavigateToTrade, onFastSwap, isDarkMode = true,
  walletAddresses, onGenerateAddress, onWithdraw, onDeposit
}) => {
  const [swapAmount, setSwapAmount] = useState<string>('');
   const [sortField, setSortField] = useState<'asset'|'price'|'change'|'marketCap'>('marketCap');
   const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  
  // Modal State
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);

  const totalBalance = assets.reduce((acc, curr) => acc + curr.valueUsd, 0);
   const axisColor = isDarkMode ? '#808191' : '#64748B'; // retained for future chart use

  const handleSwap = () => {
     if (!swapAmount) return;
     onFastSwap('USDT', 'BTC', parseFloat(swapAmount));
     setSwapAmount('');
  };

  // Modal Handlers
  const openModal = (type: 'deposit' | 'withdraw') => {
    // Default to USDT or first asset if USDT not found
    const defaultAsset = assets.find(a => a.symbol === 'USDT') || assets[0];
    setSelectedAsset(defaultAsset);
    setModalType(type);
    setStep(1);
    setSelectedNetwork(null);
    setWithdrawAddress('');
    setWithdrawAmount('');
    setLoading(false);
    setIsGeneratingAddress(false);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedAsset(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAddressClick = () => {
    if (!selectedAsset || !selectedNetwork) return;
    setIsGeneratingAddress(true);
    setTimeout(() => {
        onGenerateAddress(selectedAsset.symbol, selectedNetwork.id, selectedNetwork.standard);
        setIsGeneratingAddress(false);
    }, 2000);
  };

  const handleWithdrawSubmit = () => {
    if (!selectedAsset || !withdrawAmount) return;
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setStep(3); // Success
        onWithdraw(selectedAsset.symbol, parseFloat(withdrawAmount));
    }, 2000);
  };

  const handleSimulateDeposit = () => {
     if (!selectedAsset) return;
     setLoading(true);
     setTimeout(() => {
        setLoading(false);
        const price = selectedAsset.amount > 0 ? selectedAsset.valueUsd / selectedAsset.amount : 0;
        const depositAmount = price > 0 ? 1000 / price : (selectedAsset.symbol === 'USDT' ? 1000 : 0.05); 
        onDeposit(selectedAsset.symbol, depositAmount);
        alert(`Simulated Deposit of ${depositAmount.toFixed(4)} ${selectedAsset.symbol} received!`);
        closeModal();
     }, 1500);
  };

  // Helpers
  const currentAddress = selectedAsset && selectedNetwork 
    ? walletAddresses[selectedAsset.symbol]?.[selectedNetwork.id] 
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto animate-reveal-up relative">
      
      {/* Top Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* My Balance Card */}
        <div className="bg-deti-card/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-card flex flex-col justify-between h-[360px] relative overflow-hidden group brand-lighting-box">
          <div className="absolute top-0 right-0 w-64 h-64 bg-deti-primary/10 rounded-full blur-[80px] group-hover:bg-deti-primary/20 transition-all"></div>
          
          <div className="relative z-10 flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-deti-subtext text-sm font-medium uppercase tracking-wide">Total Balance</h2>
                   <div className="flex items-center gap-2">
                      <span className="text-4xl lg:text-5xl font-bold text-white tracking-tight mt-1">
                         ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="bg-deti-success/20 text-deti-success text-xs font-bold px-2 py-1 rounded-full flex items-center mt-2">
                         <ArrowUpRight size={12} className="mr-0.5" /> +2.4%
                      </span>
                   </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                   <MoreHorizontal />
                </button>
             </div>

             {/* Quick Stats Row */}
             <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                   <div className="text-xs text-deti-subtext mb-1">P&L (Today)</div>
                   <div className="text-deti-success font-bold">+$1,240.50</div>
                </div>
                <div>
                   <div className="text-xs text-deti-subtext mb-1">Margin Used</div>
                   <div className="text-white font-bold">12.5%</div>
                </div>
                <div>
                   <div className="text-xs text-deti-subtext mb-1">Open Orders</div>
                   <div className="text-white font-bold">4</div>
                </div>
             </div>

             {/* Action Buttons - Moved to bottom */}
             <div className="mt-auto pt-6 border-t border-white/10">
                <div className="grid grid-cols-4 gap-3">
                   <button 
                     onClick={() => openModal('deposit')}
                     className="flex items-center justify-center gap-2 py-3 bg-deti-primary hover:bg-deti-primary/90 text-white rounded-xl font-bold transition-colors shadow-lg text-sm"
                   >
                      <ArrowUpRight size={16} className="rotate-180" /> Deposit
                   </button>
                   <button 
                     onClick={() => openModal('withdraw')}
                     className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors text-sm"
                   >
                      <ArrowUpRight size={16} /> Withdraw
                   </button>
                   <button 
                     onClick={() => openModal('deposit')}
                     className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors text-sm"
                   >
                      <ArrowRightLeft size={16} /> Transfer
                   </button>
                   <button 
                     onClick={() => openModal('deposit')}
                     className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white border border-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors text-sm"
                   >
                      <RefreshCw size={16} /> Convert
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Market List */}
      <div className="bg-deti-card/60 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden brand-lighting-box">
         <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">Top Markets</h3>
            <button className="text-sm text-deti-primary font-bold hover:underline">View All Markets</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-deti-bg border-b border-white/5">
                  <tr className="text-xs font-bold text-deti-subtext uppercase tracking-wider">
                     <th className="px-6 py-4 cursor-pointer" onClick={() => { const f: any = 'asset'; setSortField(f); setSortDir(prev => sortField === f ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>Asset</th>
                     <th className="px-6 py-4 cursor-pointer" onClick={() => { const f: any = 'price'; setSortField(f); setSortDir(prev => sortField === f ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>Last Price</th>
                     <th className="px-6 py-4 cursor-pointer" onClick={() => { const f: any = 'change'; setSortField(f); setSortDir(prev => sortField === f ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'); }}>24h Change</th>
                     <th className="px-6 py-4 cursor-pointer" onClick={() => { const f: any = 'marketCap'; setSortField(f); setSortDir(prev => sortField === f ? (prev === 'asc' ? 'desc' : 'asc') : 'desc'); }}>Market Cap</th>
                     <th className="px-6 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-sm">
                           {pairs
                              .slice()
                              .filter(p => ((p.base || p.symbol || '').toString().toUpperCase() !== 'USDT'))
                    .sort((a,b) => {
                      const dir = sortDir === 'asc' ? 1 : -1;
                      if (sortField === 'asset') return dir * a.base.localeCompare(b.base);
                      if (sortField === 'price') return dir * (Number(a.price) - Number(b.price));
                      if (sortField === 'change') return dir * (Number(a.change24h) - Number(b.change24h));
                      if (sortField === 'marketCap') return dir * (Number(a.marketCap ?? a.volume24h ?? 0) - Number(b.marketCap ?? b.volume24h ?? 0));
                      return 0;
                    })
                    .map((pair) => (
                     <tr key={pair.symbol} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onNavigateToTrade(pair)}>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                                 {((pair.base || pair.symbol || pair.name || '?')[0] || '?')}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="font-bold text-white truncate max-w-[140px]">{pair.base || pair.symbol || 'UNKNOWN'}</div>
                                  {pair.name && <div className="text-deti-subtext text-xs truncate max-w-[220px]">{pair.name}</div>}
                                </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">${pair.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`px-6 py-4 font-bold ${pair.change24h >= 0 ? 'text-deti-success' : 'text-deti-danger'}`}>
                           {pair.change24h > 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 text-deti-subtext font-mono">${((pair.marketCap ?? pair.volume24h) / 1000000).toFixed(2)}M</td>
                        <td className="px-6 py-4 text-right">
                           <button className="px-4 py-2 bg-white/5 hover:bg-deti-primary hover:text-white rounded-lg text-xs font-bold text-deti-subtext transition-all">
                              Trade
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* ------------------ MODALS ------------------ */}
      
      {modalType && selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
           
           <div className="relative bg-[#181920] border border-deti-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 brand-lighting-box">
              
              {/* Modal Header with Asset Selector (Simplified to Dropdown for this version) */}
              <div className="flex justify-between items-center p-5 border-b border-deti-border bg-deti-card">
                 <div className="flex items-center gap-2">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {modalType === 'deposit' ? <ArrowDownLeft className="text-deti-success" /> : <ArrowUpRight className="text-deti-danger" />}
                        {modalType === 'deposit' ? 'Deposit' : 'Withdraw'}
                     </h3>
                     {/* Simple Asset Switcher */}
                     <div className="relative group">
                         <button className="flex items-center gap-1 bg-deti-surface px-2 py-1 rounded text-sm font-bold text-white hover:bg-white/10">
                            {selectedAsset.symbol} <ChevronDown size={14} />
                         </button>
                         <div className="absolute top-full left-0 mt-1 w-32 bg-deti-card border border-deti-border rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
                             {assets.map(a => (
                                <button key={a.symbol} onClick={() => setSelectedAsset(a)} className="w-full text-left px-3 py-2 hover:bg-white/10 text-xs text-white">
                                   {a.symbol}
                                </button>
                             ))}
                         </div>
                     </div>
                 </div>
                 <button onClick={closeModal} className="text-deti-subtext hover:text-white transition-colors"><X size={20} /></button>
              </div>

              {/* Deposit Content */}
              {modalType === 'deposit' && (
                 <div className="p-6 space-y-6">
                    {/* Network Selection */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-deti-subtext uppercase">Select Network</label>
                       <div className="grid grid-cols-2 gap-3">
                          {COIN_NETWORKS[selectedAsset.symbol]?.map(net => (
                             <button 
                                key={net.id}
                                onClick={() => setSelectedNetwork(net)}
                                className={`p-3 rounded-xl border text-left transition-all ${selectedNetwork?.id === net.id ? 'border-deti-primary bg-deti-primary/10' : 'border-deti-border bg-deti-bg hover:border-deti-subtext'}`}
                             >
                                <div className="font-bold text-sm text-white">{net.standard}</div>
                                <div className="text-xs text-deti-subtext mt-1">{net.name}</div>
                                <div className="text-[10px] text-deti-success mt-1">Arrival: {net.arrivalTime}</div>
                             </button>
                          ))}
                          {!COIN_NETWORKS[selectedAsset.symbol] && <div className="text-sm text-gray-500 col-span-2">No networks available.</div>}
                       </div>
                    </div>

                    {/* Address View */}
                    {selectedNetwork ? (
                       currentAddress ? (
                          <div className="space-y-4 animate-in slide-in-from-bottom-2">
                             <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                                <QrCode className="w-32 h-32 text-black" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-deti-subtext uppercase">Deposit Address</label>
                                <div className="flex gap-2">
                                   <div className="flex-1 bg-deti-bg border border-deti-border rounded-xl p-3 text-sm font-mono text-gray-300 break-all">
                                      {currentAddress}
                                   </div>
                                   <button 
                                      onClick={() => handleCopy(currentAddress)}
                                      className="p-3 bg-deti-card hover:bg-deti-border border border-deti-border rounded-xl text-white transition-colors"
                                   >
                                      {copied ? <CheckCircle2 className="text-deti-success" /> : <Copy />}
                                   </button>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-orange-400 bg-orange-400/10 p-3 rounded-lg mt-2">
                                   <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                   <p>Send only {selectedAsset.symbol} ({selectedNetwork.standard}) to this address.</p>
                                </div>
                                <button 
                                   onClick={handleSimulateDeposit}
                                   disabled={loading}
                                   className="w-full mt-4 py-2 bg-deti-bg border border-deti-border hover:bg-deti-primary/10 hover:border-deti-primary hover:text-deti-primary text-deti-subtext rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                   <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                   {loading ? 'Confirming...' : 'Simulate Deposit (Demo)'}
                                </button>
                             </div>
                          </div>
                       ) : (
                          <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
                             <div className="w-16 h-16 mx-auto bg-deti-surface rounded-full flex items-center justify-center border border-deti-border">
                                <Server className="w-8 h-8 text-deti-subtext" />
                             </div>
                             <button 
                               onClick={handleGenerateAddressClick}
                               disabled={isGeneratingAddress}
                               className="w-full py-3.5 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                             >
                                {isGeneratingAddress ? <RefreshCcw className="animate-spin w-5 h-5" /> : `Generate ${selectedNetwork.standard} Address`}
                             </button>
                          </div>
                       )
                    ) : (
                       <div className="text-center py-8 text-deti-subtext border-2 border-dashed border-deti-border rounded-xl flex flex-col items-center gap-2">
                          <Lock className="w-8 h-8 opacity-50" />
                          <span>Select a network</span>
                       </div>
                    )}
                 </div>
              )}

              {/* Withdraw Content */}
              {modalType === 'withdraw' && (
                 <div className="p-6">
                    {step === 1 && (
                      <div className="space-y-5">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-deti-subtext uppercase">Select Network</label>
                             <div className="relative group">
                                <button className="w-full bg-deti-bg border border-deti-border rounded-xl p-3 flex justify-between items-center text-sm text-white">
                                   <span className={selectedNetwork ? 'text-white' : 'text-gray-500'}>{selectedNetwork ? selectedNetwork.name : 'Select Network'}</span>
                                   <ChevronDown size={16} className="text-gray-500" />
                                </button>
                                <div className="absolute top-full left-0 mt-1 w-full bg-deti-card border border-deti-border rounded-xl shadow-xl z-50 hidden group-hover:block p-1">
                                    {COIN_NETWORKS[selectedAsset.symbol]?.map(net => (
                                      <div key={net.id} onClick={() => setSelectedNetwork(net)} className="p-2 hover:bg-white/10 rounded cursor-pointer text-sm text-white">
                                         {net.name} ({net.standard})
                                      </div>
                                    ))}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-xs font-bold text-deti-subtext uppercase">Withdrawal Address</label>
                             <input 
                               type="text" 
                               value={withdrawAddress}
                               onChange={(e) => setWithdrawAddress(e.target.value)}
                               placeholder={`Enter ${selectedAsset.name} Address`}
                               className="w-full bg-deti-bg border border-deti-border rounded-xl p-3 text-sm text-white focus:border-deti-primary outline-none"
                             />
                          </div>

                          <div className="space-y-2">
                             <div className="flex justify-between">
                                <label className="text-xs font-bold text-deti-subtext uppercase">Amount</label>
                                <span className="text-xs text-deti-subtext">Avbl: {selectedAsset.amount}</span>
                             </div>
                             <div className="relative">
                                <input 
                                  type="number" 
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  className="w-full bg-deti-bg border border-deti-border rounded-xl p-3 text-sm text-white focus:border-deti-primary outline-none"
                                  placeholder="0.00"
                                />
                                <button 
                                  onClick={() => setWithdrawAmount(selectedAsset.amount.toString())}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-deti-primary hover:text-white"
                                >
                                  MAX
                                </button>
                             </div>
                          </div>

                          <button 
                            disabled={!selectedNetwork || !withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) > selectedAsset.amount}
                            onClick={() => setStep(2)}
                            className="w-full py-3.5 mt-2 bg-deti-primary hover:bg-deti-primary/90 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold transition-all"
                          >
                             Proceed
                          </button>
                      </div>
                    )}

                    {step === 2 && (
                       <div className="space-y-6 animate-in slide-in-from-right-4">
                          <div className="text-center">
                             <ShieldCheck className="w-12 h-12 text-deti-primary mx-auto mb-3" />
                             <h4 className="text-lg font-bold text-white">Security Verification</h4>
                          </div>
                          <div className="bg-deti-bg rounded-xl p-4 space-y-3 border border-deti-border text-sm">
                             <div className="flex justify-between"><span className="text-deti-subtext">Address</span><span className="text-white font-mono">{withdrawAddress.slice(0, 6)}...</span></div>
                             <div className="flex justify-between"><span className="text-deti-subtext">Amount</span><span className="text-white font-bold">{withdrawAmount} {selectedAsset.symbol}</span></div>
                          </div>
                          <div className="flex gap-3">
                             <button onClick={() => setStep(1)} className="flex-1 py-3 bg-deti-card border border-deti-border text-white rounded-xl font-bold">Back</button>
                             <button onClick={handleWithdrawSubmit} disabled={loading} className="flex-1 py-3 bg-deti-primary text-white rounded-xl font-bold">{loading ? 'Processing...' : 'Confirm'}</button>
                          </div>
                       </div>
                    )}

                    {step === 3 && (
                       <div className="text-center py-8 animate-in zoom-in-95">
                          <div className="w-16 h-16 bg-deti-success/20 text-deti-success rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
                          <h4 className="text-xl font-bold text-white mb-6">Withdrawal Submitted</h4>
                          <button onClick={closeModal} className="px-8 py-3 bg-deti-card border border-deti-border hover:bg-white/5 text-white rounded-xl font-bold">Close</button>
                       </div>
                    )}
                 </div>
              )}

           </div>
        </div>
      )}
    </div>
  );
});