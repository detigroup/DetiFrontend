
import React, { useState } from 'react';
import { PortfolioAsset, Transaction, CryptoNetwork } from '../types';
import { MOCK_TRANSACTIONS, COIN_NETWORKS } from '../constants';
import { 
  Wallet as WalletIcon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  X,
  ChevronDown,
  ShieldCheck,
  RefreshCcw,
  Plus,
  Server,
  Lock
} from 'lucide-react';

interface WalletProps {
  assets: PortfolioAsset[];
  walletAddresses: Record<string, Record<string, string>>;
  onGenerateAddress: (symbol: string, networkId: string, standard: string) => void;
  onWithdraw: (symbol: string, amount: number) => void;
  onDeposit: (symbol: string, amount: number) => void;
   // Fix REason: balancesMap provided by App when fetching /api/v1/balances
   balancesMap?: Record<string, { actual: number; orders: number }>; 
   onRefreshBalances?: () => void;
   balancesLastUpdated?: number | null;
}

export const Wallet: React.FC<WalletProps> = ({ assets, walletAddresses, onGenerateAddress, onWithdraw, onDeposit, balancesMap, onRefreshBalances, balancesLastUpdated }) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
  
  const [isGeneratingAddress, setIsGeneratingAddress] = useState(false);

  // Modal State
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalBalance = assets.reduce((sum, a) => sum + a.valueUsd, 0);

  const openModal = (type: 'deposit' | 'withdraw', asset: PortfolioAsset) => {
    setSelectedAsset(asset);
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
    
    // Simulate API delay locally for UX, then call prop
    setTimeout(() => {
        onGenerateAddress(selectedAsset.symbol, selectedNetwork.id, selectedNetwork.standard);
        setIsGeneratingAddress(false);
    }, 2000);
  };

  const handleWithdrawSubmit = () => {
    if (!selectedAsset || !withdrawAmount) return;
    setLoading(true);
    // Simulate network delay
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
        // Simulate a deposit amount
        const price = selectedAsset.amount > 0 ? selectedAsset.valueUsd / selectedAsset.amount : 0;
        const depositAmount = price > 0 ? 1000 / price : (selectedAsset.symbol === 'USDT' ? 1000 : 0.05); 
        onDeposit(selectedAsset.symbol, depositAmount);
        alert(`Simulated Deposit of ${depositAmount.toFixed(4)} ${selectedAsset.symbol} received!`);
        closeModal();
     }, 1500);
  };

  // Helper to get current address if exists from props
  const currentAddress = selectedAsset && selectedNetwork 
    ? walletAddresses[selectedAsset.symbol]?.[selectedNetwork.id] 
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      
      {/* Wallet Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-white mb-1">Wallet Overview</h1>
           <p className="text-deti-subtext">Manage your digital assets, deposits, and withdrawals.</p>
        </div>
      <div className="flex gap-2 bg-deti-card p-1 rounded-xl border border-deti-border items-center">
           <button 
             onClick={() => setActiveTab('assets')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'assets' ? 'bg-deti-primary text-white shadow-lg' : 'text-deti-subtext hover:text-white'}`}
           >
             My Assets
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-deti-primary text-white shadow-lg' : 'text-deti-subtext hover:text-white'}`}
           >
             Transaction History
           </button>
                <button onClick={() => onRefreshBalances && onRefreshBalances()} title="Refresh balances" className="ml-2 px-3 py-1 rounded-lg text-sm text-deti-subtext bg-deti-bg border border-deti-border hover:text-white">
              <RefreshCcw size={14} />
           </button>
                {balancesLastUpdated && (
                   <div className="text-[11px] text-deti-subtext ml-2">Updated {new Date(balancesLastUpdated).toLocaleTimeString()}</div>
                )}
        </div>
      </div>

      {/* Equity Card */}
      <div className="bg-gradient-to-r from-deti-card to-deti-bg border border-deti-border rounded-3xl p-8 shadow-card relative overflow-hidden brand-lighting-box">
         <div className="absolute top-0 right-0 p-32 bg-deti-primary/10 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-deti-subtext mb-2">
                  <WalletIcon className="w-5 h-5" />
                  <span className="font-medium tracking-wide text-sm uppercase">Total Equity Value</span>
               </div>
               <div className="flex items-baseline gap-4">
                  <h2 className="text-5xl font-mono font-bold text-white tracking-tighter">
                    {totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </h2>
                  <div className="px-3 py-1 bg-deti-success/20 text-deti-success rounded-full text-sm font-bold flex items-center gap-1">
                     <ArrowUpRight size={14} /> +2.4% (24h)
                  </div>
               </div>
               <p className="text-deti-subtext text-sm">≈ {(totalBalance / 64000).toFixed(4)} BTC</p>
            </div>
            
            <div className="flex gap-4 items-center">
               <button onClick={() => openModal('deposit', assets[2])} className="flex flex-col items-center justify-center w-24 h-24 bg-deti-surface hover:bg-deti-primary/20 border border-deti-border hover:border-deti-primary rounded-2xl transition-all group gap-2">
                  <div className="p-2 bg-deti-success/10 text-deti-success rounded-lg group-hover:scale-110 transition-transform">
                     <ArrowDownLeft size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-300 group-hover:text-white">Deposit</span>
               </button>
               <button onClick={() => openModal('withdraw', assets[2])} className="flex flex-col items-center justify-center w-24 h-24 bg-deti-surface hover:bg-deti-danger/20 border border-deti-border hover:border-deti-danger rounded-2xl transition-all group gap-2">
                  <div className="p-2 bg-deti-danger/10 text-deti-danger rounded-lg group-hover:scale-110 transition-transform">
                     <ArrowUpRight size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-300 group-hover:text-white">Withdraw</span>
               </button>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'assets' ? (
        <div className="bg-deti-card border border-deti-border rounded-3xl overflow-hidden shadow-sm brand-lighting-box">
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead className="bg-deti-bg border-b border-deti-border">
                    <tr className="text-left text-xs font-bold text-deti-subtext uppercase tracking-wider">
                       <th className="px-6 py-4">Asset</th>
                       <th className="px-6 py-4">Available</th>
                       <th className="px-6 py-4">On Orders</th>
                       <th className="px-6 py-4">Value (USD)</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-deti-border/50">
                    {assets.map((asset) => (
                       <tr key={asset.symbol} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: asset.color }}>
                                   {asset.symbol[0]}
                                </div>
                                <div>
                                   <div className="font-bold text-white">{asset.symbol}</div>
                                   <div className="text-xs text-deti-subtext">{asset.name}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 font-mono text-sm text-gray-300">{(balancesMap?.[asset.symbol]?.actual ?? asset.amount).toLocaleString()}</td>
                          <td className="px-6 py-5 font-mono text-sm text-gray-300">{(balancesMap?.[asset.symbol]?.orders ?? 0).toLocaleString()}</td>
                          <td className="px-6 py-5 font-mono text-sm font-bold text-white">${asset.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-5">
                             <div className="flex justify-end gap-3">
                                <button 
                                  onClick={() => openModal('deposit', asset)}
                                  className="px-4 py-1.5 rounded-lg border border-deti-border hover:border-deti-success/50 hover:bg-deti-success/10 hover:text-deti-success text-xs font-bold transition-all text-deti-subtext"
                                >
                                   Deposit
                                </button>
                                <button 
                                  onClick={() => openModal('withdraw', asset)}
                                  className="px-4 py-1.5 rounded-lg border border-deti-border hover:border-deti-primary/50 hover:bg-deti-primary/10 hover:text-deti-primary text-xs font-bold transition-all text-deti-subtext"
                                >
                                   Withdraw
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : (
         <div className="bg-deti-card border border-deti-border rounded-3xl overflow-hidden shadow-sm brand-lighting-box">
            <div className="p-6 border-b border-deti-border">
               <h3 className="font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-deti-subtext" /> Recent Transactions
               </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                 <thead className="bg-deti-bg border-b border-deti-border">
                    <tr className="text-left text-xs font-bold text-deti-subtext uppercase tracking-wider">
                       <th className="px-6 py-4">Type</th>
                       <th className="px-6 py-4">Asset</th>
                       <th className="px-6 py-4">Amount</th>
                       <th className="px-6 py-4">Network</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-deti-border/50">
                    {MOCK_TRANSACTIONS.map((tx) => (
                       <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                             <span className={`text-xs font-bold px-2 py-1 rounded ${
                                tx.type === 'Deposit' ? 'bg-deti-success/10 text-deti-success' : 
                                tx.type === 'Withdraw' ? 'bg-deti-danger/10 text-deti-danger' : 
                                'bg-deti-primary/10 text-deti-primary'
                             }`}>
                                {tx.type}
                             </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm">{tx.asset}</td>
                          <td className="px-6 py-4 font-mono text-sm">{tx.amount}</td>
                          <td className="px-6 py-4 text-sm text-deti-subtext">{tx.network || '-'}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5">
                                {tx.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 text-deti-success" /> : <AlertCircle className="w-3 h-3 text-yellow-500" />}
                                <span className={`text-sm ${tx.status === 'Completed' ? 'text-deti-success' : 'text-yellow-500'}`}>{tx.status}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-deti-subtext font-mono">{tx.date}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            </div>
         </div>
      )}

      {/* -------------------- MODALS -------------------- */}

      {/* Modal Backdrop */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
           
           <div className="relative bg-[#181920] border border-deti-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 brand-lighting-box">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-deti-border bg-deti-card">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {modalType === 'deposit' ? <ArrowDownLeft className="text-deti-success" /> : <ArrowUpRight className="text-deti-danger" />}
                    {modalType === 'deposit' ? 'Deposit' : 'Withdraw'} {selectedAsset?.name}
                 </h3>
                 <button onClick={closeModal} className="text-deti-subtext hover:text-white transition-colors"><X size={20} /></button>
              </div>

              {/* Deposit Content */}
              {modalType === 'deposit' && selectedAsset && (
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
                          {!COIN_NETWORKS[selectedAsset.symbol] && <div className="text-sm text-gray-500 col-span-2">No networks available for mock data.</div>}
                       </div>
                    </div>

                    {/* Dynamic View: Create Address vs View Address */}
                    {selectedNetwork ? (
                       currentAddress ? (
                          // VIEW 1: ADDRESS DISPLAY
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
                                   <p>Send only {selectedAsset.symbol} ({selectedNetwork.standard}) to this address. Sending any other asset may result in permanent loss.</p>
                                </div>
                                
                                {/* Simulation Button */}
                                <button 
                                   onClick={handleSimulateDeposit}
                                   disabled={loading}
                                   className="w-full mt-4 py-2 bg-deti-bg border border-deti-border hover:bg-deti-primary/10 hover:border-deti-primary hover:text-deti-primary text-deti-subtext rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                   <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                   {loading ? 'Confirming on Chain...' : 'Simulate Incoming Deposit (Demo)'}
                                </button>
                             </div>
                          </div>
                       ) : (
                          // VIEW 2: CREATE ADDRESS
                          <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
                             <div className="w-20 h-20 mx-auto bg-deti-surface rounded-full flex items-center justify-center border border-deti-border relative">
                                <Server className="w-8 h-8 text-deti-subtext" />
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-deti-card rounded-full border border-deti-border flex items-center justify-center">
                                   <Plus className="w-4 h-4 text-deti-primary" />
                                </div>
                             </div>
                             
                             <div className="space-y-2">
                                <h4 className="text-lg font-bold text-white">Create {selectedAsset.symbol} Wallet</h4>
                                <p className="text-sm text-deti-subtext max-w-xs mx-auto">
                                   You don't have a {selectedNetwork.name} address for {selectedAsset.name} yet.
                                </p>
                             </div>

                             <div className="bg-deti-bg/50 p-4 rounded-xl border border-deti-border text-left mx-2">
                                <div className="flex items-center gap-3 mb-2">
                                   <ShieldCheck className="w-5 h-5 text-deti-success" />
                                   <span className="text-sm font-bold text-white">Secure Address Generation</span>
                                </div>
                                <p className="text-xs text-deti-subtext leading-relaxed">
                                   A unique, permanent deposit address will be generated on the blockchain network and linked to your DETI account.
                                </p>
                             </div>

                             <button 
                               onClick={handleGenerateAddressClick}
                               disabled={isGeneratingAddress}
                               className="w-full py-3.5 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:shadow-glow-gold hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                             >
                                {isGeneratingAddress ? (
                                   <>
                                      <RefreshCcw className="animate-spin w-5 h-5" /> Generating...
                                   </>
                                ) : (
                                   `Generate ${selectedNetwork.standard} Address`
                                )}
                             </button>
                          </div>
                       )
                    ) : (
                       <div className="text-center py-12 text-deti-subtext border-2 border-dashed border-deti-border rounded-xl flex flex-col items-center gap-3">
                          <Lock className="w-8 h-8 opacity-50" />
                          <span>Select a network to continue</span>
                       </div>
                    )}
                 </div>
              )}

              {/* Withdraw Content */}
              {modalType === 'withdraw' && selectedAsset && (
                 <div className="p-6">
                    {step === 1 && (
                      <div className="space-y-5">
                          {/* Network */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-deti-subtext uppercase">Select Network</label>
                             <div className="relative">
                                <button className="w-full bg-deti-bg border border-deti-border rounded-xl p-3 flex justify-between items-center text-sm text-white group">
                                   <span className={selectedNetwork ? 'text-white' : 'text-gray-500'}>{selectedNetwork ? selectedNetwork.name : 'Select Transfer Network'}</span>
                                   <ChevronDown size={16} className="text-gray-500" />
                                </button>
                                {/* Dropdown mock - just show list below for simplicity in this demo */}
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                  {COIN_NETWORKS[selectedAsset.symbol]?.map(net => (
                                      <div 
                                        key={net.id} 
                                        onClick={() => setSelectedNetwork(net)}
                                        className={`p-3 rounded-lg cursor-pointer flex justify-between items-center border ${selectedNetwork?.id === net.id ? 'border-deti-primary bg-deti-primary/10' : 'border-deti-border bg-deti-card hover:border-gray-500'}`}
                                      >
                                         <div>
                                            <div className="font-bold text-sm text-white">{net.standard}</div>
                                            <div className="text-xs text-deti-subtext">Fee: {net.fee} {selectedAsset.symbol}</div>
                                         </div>
                                         <div className="text-xs text-deti-success">{net.arrivalTime}</div>
                                      </div>
                                  ))}
                                </div>
                             </div>
                          </div>

                          {/* Address */}
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

                          {/* Amount */}
                          <div className="space-y-2">
                             <div className="flex justify-between">
                                <label className="text-xs font-bold text-deti-subtext uppercase">Amount</label>
                                <span className="text-xs text-deti-subtext">Available: {selectedAsset.amount} {selectedAsset.symbol}</span>
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
                             {selectedNetwork && withdrawAmount && (
                                <div className="flex justify-between text-xs text-gray-400 px-1">
                                   <span>Network Fee: {selectedNetwork.fee} {selectedAsset.symbol}</span>
                                   <span>Receive: {(parseFloat(withdrawAmount) - selectedNetwork.fee).toFixed(4)} {selectedAsset.symbol}</span>
                                </div>
                             )}
                          </div>

                          <button 
                            disabled={!selectedNetwork || !withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) > selectedAsset.amount}
                            onClick={() => setStep(2)}
                            className="w-full py-3.5 mt-2 bg-deti-primary hover:bg-deti-primary/90 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-bold transition-all"
                          >
                             Proceed to Confirm
                          </button>
                      </div>
                    )}

                    {step === 2 && (
                       <div className="space-y-6 animate-in slide-in-from-right-4">
                          <div className="text-center">
                             <ShieldCheck className="w-12 h-12 text-deti-primary mx-auto mb-3" />
                             <h4 className="text-lg font-bold text-white">Security Verification</h4>
                             <p className="text-sm text-deti-subtext">Please review transaction details carefully.</p>
                          </div>

                          <div className="bg-deti-bg rounded-xl p-4 space-y-3 border border-deti-border">
                             <div className="flex justify-between text-sm">
                                <span className="text-deti-subtext">Address</span>
                                <span className="text-white font-mono">{withdrawAddress.slice(0, 6)}...{withdrawAddress.slice(-4)}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-deti-subtext">Network</span>
                                <span className="text-white">{selectedNetwork?.name}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-deti-subtext">Total Amount</span>
                                <span className="text-white font-bold">{withdrawAmount} {selectedAsset.symbol}</span>
                             </div>
                             <div className="border-t border-deti-border pt-3 flex justify-between text-sm">
                                <span className="text-deti-subtext">You will receive</span>
                                <span className="text-deti-success font-bold text-lg">
                                  {(parseFloat(withdrawAmount) - (selectedNetwork?.fee || 0)).toFixed(4)} {selectedAsset.symbol}
                                </span>
                             </div>
                          </div>
                          
                          <div className="flex gap-3">
                             <button onClick={() => setStep(1)} className="flex-1 py-3 bg-deti-card border border-deti-border text-white rounded-xl font-bold hover:bg-white/5">Back</button>
                             <button 
                               onClick={handleWithdrawSubmit} 
                               disabled={loading}
                               className="flex-1 py-3 bg-deti-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-deti-primary/90"
                             >
                                {loading ? 'Processing...' : 'Confirm Withdraw'}
                             </button>
                          </div>
                       </div>
                    )}

                    {step === 3 && (
                       <div className="text-center py-8 animate-in zoom-in-95">
                          <div className="w-16 h-16 bg-deti-success/20 text-deti-success rounded-full flex items-center justify-center mx-auto mb-4">
                             <CheckCircle2 size={32} />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-2">Withdrawal Submitted</h4>
                          <p className="text-deti-subtext mb-6">Your transaction is being processed. <br/> You will receive a notification once completed.</p>
                          <button onClick={closeModal} className="px-8 py-3 bg-deti-card border border-deti-border hover:bg-white/5 text-white rounded-xl font-bold">
                             Return to Wallet
                          </button>
                       </div>
                    )}
                 </div>
              )}

           </div>
        </div>
      )}

    </div>
  );
};
