import React, { useState, useEffect } from 'react';
import { X, Loader2, Shield } from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onSubmit: (code: string) => Promise<void>;
  isLoading?: boolean;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  email = '',
  onSubmit,
  isLoading = false,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter your 2FA code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSubmit(code);
      setCode('');
    } catch (err: any) {
      const errMsg = typeof err?.message === 'string' ? err.message : 'Failed to verify 2FA code';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-[#2a2a3e]/95 backdrop-blur-xl border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-deti-primary to-deti-secondary rounded-full flex items-center justify-center mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-300">
            Enter the code from your authentication app
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 2FA Code Input */}
          <div>
            <label className="text-xs font-bold text-deti-subtext uppercase block mb-2">
              Authentication Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              maxLength={6}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-4xl text-white placeholder-gray-500 focus:border-deti-primary outline-none transition-all text-center font-semibold tracking-widest"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-400 text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isLoading || code.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-deti-primary to-deti-secondary text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Info Message */}
          <div className="text-xs text-gray-400 text-center">
            Don't have your code? Contact support
          </div>
        </form>

        {/* Email Info */}
        {email && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Verification code sent to <span className="text-gray-300 font-semibold">{email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
