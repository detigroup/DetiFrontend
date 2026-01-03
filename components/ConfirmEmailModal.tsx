import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ConfirmEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onConfirm: (code: string) => Promise<void>;
  onResendCode?: () => Promise<void>;
}

export const ConfirmEmailModal: React.FC<ConfirmEmailModalProps> = ({
  isOpen,
  onClose,
  email = '',
  onConfirm,
  onResendCode,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend code (300 seconds = 5 minutes)
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Reset countdown when modal opens (start at 300 seconds)
  useEffect(() => {
    if (isOpen) {
      setResendCountdown(300);
      setCode('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the confirmation code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onConfirm(code);
      setCode('');
      onClose();
    } catch (err: any) {
      const errMsg = typeof err?.message === 'string' ? err.message : 'Failed to confirm email';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!onResendCode || resendCountdown > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      await onResendCode();
      setResendCountdown(300);
    } catch (err: any) {
      const errMsg = typeof err?.message === 'string' ? err.message : 'Failed to resend code';
      setError(errMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          <h2 className="text-3xl font-bold text-white mb-4">Confirm email</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-deti-primary to-deti-secondary rounded-full mx-auto mb-6"></div>
          <p className="text-base text-gray-300 leading-relaxed">
            Email with a code has been sent to you, please enter it in the form below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="space-y-6">
          {/* Code Input */}
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter verification code"
              maxLength={20}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-lg text-white placeholder-gray-400 focus:border-deti-primary outline-none transition-all text-center font-semibold"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-400 text-center">{error}</div>
          )}

          {/* Resend Code Countdown */}
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Send code again in{' '}
              <span className="font-bold text-deti-primary">
                {Math.floor(resendCountdown / 60)}:{(resendCountdown % 60).toString().padStart(2, '0')} minutes
              </span>
            </p>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-deti-primary to-deti-secondary text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'CONFIRM EMAIL'}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-red-500/80 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-colors active:scale-[0.98]"
          >
            BACK
          </button>

          {/* Resend Code Button - appears after countdown */}
          {resendCountdown === 0 && (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendLoading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Resend Code'}
            </button>
          )}
        </form>

        {/* Email Info */}
        {email && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Code sent to <span className="text-gray-300 font-semibold">{email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
