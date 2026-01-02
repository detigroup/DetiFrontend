import React, { useRef, useCallback, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaFieldProps {
  siteKey?: string;
  onToken: (token: string | null) => void;
  error?: string;
  disabled?: boolean;
}

export const RecaptchaField: React.FC<RecaptchaFieldProps> = ({ 
  siteKey, 
  onToken, 
  error,
  disabled = false 
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const isDev = (import.meta as any)?.env?.VITE_DEBUG === 'true' || process.env.NODE_ENV === 'development';

  // Dev warning if site key is missing
  useEffect(() => {
    if (isDev && !siteKey) {
      console.warn('⚠️ reCAPTCHA: Missing VITE_RECAPTCHA_SITE_KEY environment variable. Widget will not render.');
    }
  }, [siteKey, isDev]);

  const handleChange = useCallback((token: string | null) => {
    if (isDev) {
      console.log('reCAPTCHA token:', token ? '✓ received' : '✗ none');
    }
    onToken(token);
  }, [onToken, isDev]);

  const handleExpired = useCallback(() => {
    if (isDev) {
      console.log('reCAPTCHA: token expired');
    }
    onToken(null);
  }, [onToken, isDev]);

  // Fail gracefully if no site key
  if (!siteKey) {
    if (isDev) {
      return (
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-xs text-red-300 my-2">
          ⚠️ reCAPTCHA widget unavailable - missing site key (VITE_RECAPTCHA_SITE_KEY)
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative min-h-[80px] my-4 py-2 px-0">
      <div className="flex justify-center items-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleChange}
          onExpired={handleExpired}
          onErrored={() => {
            if (isDev) console.error('reCAPTCHA: error callback');
          }}
          theme="dark"
          size="normal"
          tabIndex={0}
        />
      </div>
      {error && (
        <div className="text-xs text-red-400 text-center mt-2">{error}</div>
      )}
    </div>
  );
};
