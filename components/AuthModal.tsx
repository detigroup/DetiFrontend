
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Globe, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DobDatePicker } from './DobDatePicker';
import { RecaptchaField } from './RecaptchaField';

// Country name to ISO code mapping
const COUNTRY_CODES: Record<string, string> = {
  'United Arab Emirates': 'AE',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Vietnam': 'VN',
  'Singapore': 'SG',
  'Germany': 'DE',
  'Japan': 'JP',
  'Canada': 'CA',
  'Other': 'XX'
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
   const [captchaError, setCaptchaError] = useState<string | null>(null);

   const recaptchaSiteKey = ((import.meta as any)?.env?.VITE_RECAPTCHA_SITE_KEY) || '6Ld3ZREsAAAAAFcoDEP3w6yJug9y7cT9NTkyt_jT';

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscription, setSubscription] = useState(false);
  const [isValidDob, setIsValidDob] = useState(false);

  // Reset state when modal is reopened
  useEffect(() => {
    setFormError(null);
    setIsValidDob(false);
      setCaptchaToken(null);
      setCaptchaError(null);
  }, [isOpen]);

  if (!isOpen) return null;

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setLoading(true);

      if (mode === 'login') {
         try {
            const domain = ((import.meta as any)?.env?.VITE_API_DOMAIN) || 'https://detidex.yeuthich.net';
            const apiPath = ((import.meta as any)?.env?.VITE_LOGIN_API) || '/api/v1/auth/login/';
            const url = `${domain.replace(/\/$/, '')}${apiPath}`;

            const payload: Record<string, any> = {
               password,
               email,
            };

            const res = await fetch(url, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
               },
               body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
               let msg = 'Login failed';
               // Try to extract error message from various response formats
               if (typeof data?.error === 'object' && Array.isArray(data.error) && data.error.length > 0) {
                  // Handle error as array of objects with message/code
                  msg = typeof data.error[0]?.message === 'string' ? data.error[0].message : (data.error[0]?.message ? JSON.stringify(data.error[0].message) : `Login failed (status ${res.status})`);
               }
               else if (typeof data?.message === 'string') msg = data.message;
               else if (typeof data?.error === 'string') msg = data.error;
               else if (typeof data?.detail === 'string') msg = data.detail;
               else if (typeof data?.errors === 'object' && data.errors !== null) {
                  // Handle array of errors or object with error details
                  const errorKey = Object.keys(data.errors)[0];
                  const errorValue = data.errors[errorKey];
                  msg = typeof errorValue === 'string' ? errorValue : (Array.isArray(errorValue) ? errorValue[0] : `Login failed (status ${res.status})`);
               }
               else msg = data?.msg || `Login failed (status ${res.status})`;
               setFormError(msg);
               setLoading(false);
               return;
            }

            // Persist cookies/tokens returned in the JSON response.
            // Note: HttpOnly cookies must be set server-side with Set-Cookie; this writes client-accessible cookies
            const setCookie = (name: string, value: string, opts: { maxAge?: number, domain?: string, secure?: boolean, sameSite?: 'Lax'|'Strict'|'None' } = {}) => {
               try {
                  const secure = opts.secure ?? (window.location.protocol === 'https:');
                  let cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
                  if (opts.maxAge) cookie += ` max-age=${opts.maxAge};`;
                  if (opts.domain) cookie += ` domain=${opts.domain};`;
                  if (secure) cookie += ' Secure;';
                  cookie += ` SameSite=${opts.sameSite ?? 'Lax'};`;
                  document.cookie = cookie;
               } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Unable to set cookie', name, e);
               }
            };

            const cookieSource: any = data.cookies || data.tokens || data || {};
            const cookieKeys = ['jwt','jwt_auth_token','jwt_refresh_token','sessionid','lang','messages'];
            cookieKeys.forEach((k) => {
               const v = cookieSource[k] ?? cookieSource?.[k];
               if (v) {
                  setCookie(k, String(v), { maxAge: 60 * 60 * 24 * 30 }); // default 30 days
                  try { localStorage.setItem(k, String(v)); } catch {}
               }
            });

            // Ensure a primary token is stored for Authorization header usage
            const primaryToken = cookieSource.token || cookieSource.access || cookieSource.access_token || cookieSource.jwt || cookieSource.jwt_auth_token || '';
            if (primaryToken) {
               try {
                  localStorage.setItem('jwt', String(primaryToken));
                  localStorage.setItem('token', String(primaryToken));
                  localStorage.setItem('jwt_auth_token', String(primaryToken));
                  setCookie('jwt_front', String(primaryToken), { maxAge: 60 * 60 * 24 * 30 });
               } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Unable to persist primary token', e);
               }
            }

            const userRaw = data.user || data.data || data.profile || data;
            const mapped: UserProfile = {
               id: userRaw?.id?.toString() || userRaw?.uuid || 'USR-' + Math.floor(Math.random() * 10000),
               name: userRaw?.name || userRaw?.username || (email ? email.split('@')[0] : 'User'),
               email: userRaw?.email || email,
               phone: userRaw?.phone,
               kycStatus: userRaw?.kycStatus || userRaw?.kyc_status || 'Unverified',
               tier: userRaw?.tier ?? 0,
               avatar: userRaw?.avatar || userRaw?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            };

            setLoading(false);
            onLogin(mapped);
            onClose();
         } catch (err: any) {
            console.error('Login error', err);
            const errMsg = typeof err?.message === 'string' ? err.message : 'Network error during login';
            setFormError(errMsg);
            setLoading(false);
         }

         return;
      }

      // Registration / API call
      if (mode === 'register') {
         if (!captchaToken) {
            setCaptchaError('Please complete the reCAPTCHA check.');
            setFormError('Please complete the reCAPTCHA check.');
            setLoading(false);
            return;
         }
         // Format birth_day to ISO string with time: YYYY-MM-DDTHH:MM:SS.SSSZ
         const birthDateTime = new Date(birthDay);
         birthDateTime.setHours(0, 0, 0, 0);
         const birthDayISO = birthDateTime.toISOString();

         // Get country code from country name
         const countryCode = COUNTRY_CODES[country] || 'XX';

         // Get current language from i18n
         const currentLang = i18n.language || 'en';

         // Build registration payload
         const payload: Record<string, any> = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            username: email,
            password: password,
            password1: password,
            password2: password,
            birth_day: birthDayISO,
            country: countryCode,
            lang: currentLang,
            subscription: subscription,
            captcha: captchaToken,
            captchaResponse: captchaToken
         };

         // Dev logging
         if ((import.meta as any)?.env?.VITE_DEBUG === 'true') {
            console.log('registration payload', payload);
         }

         try {
            const domain = ((import.meta as any)?.env?.VITE_API_DOMAIN) || 'https://detidex.yeuthich.net';
            const apiPath = '/api/v1/auth/registration/';
            const url = `${domain.replace(/\/$/, '')}${apiPath}`;

            const res = await fetch(url, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
               },
               body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
               let msg = 'Registration failed';
               // Try to extract error message from various response formats
               if (typeof data?.error === 'object' && Array.isArray(data.error) && data.error.length > 0) {
                  // Handle error as array of objects with message/code
                  msg = typeof data.error[0]?.message === 'string' ? data.error[0].message : (data.error[0]?.message ? JSON.stringify(data.error[0].message) : `Registration failed (status ${res.status})`);
               }
               else if (typeof data?.message === 'string') msg = data.message;
               else if (typeof data?.error === 'string') msg = data.error;
               else if (typeof data?.detail === 'string') msg = data.detail;
               else if (typeof data?.errors === 'object' && data.errors !== null) {
                  // Handle array of errors or object with error details
                  const errorKey = Object.keys(data.errors)[0];
                  const errorValue = data.errors[errorKey];
                  msg = typeof errorValue === 'string' ? errorValue : (Array.isArray(errorValue) ? errorValue[0] : `Registration failed (status ${res.status})`);
               }
               else msg = data?.msg || `Registration failed (status ${res.status})`;
               setFormError(msg);
               setLoading(false);
               return;
            }

            // Success: show success message, then redirect or close modal
            setLoading(false);
            
            // Optional: persist tokens if returned
            const setCookie = (name: string, value: string, opts: { maxAge?: number, domain?: string, secure?: boolean, sameSite?: 'Lax'|'Strict'|'None' } = {}) => {
               try {
                  const secure = opts.secure ?? (window.location.protocol === 'https:');
                  let cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
                  if (opts.maxAge) cookie += ` max-age=${opts.maxAge};`;
                  if (opts.domain) cookie += ` domain=${opts.domain};`;
                  if (secure) cookie += ' Secure;';
                  cookie += ` SameSite=${opts.sameSite ?? 'Lax'};`;
                  document.cookie = cookie;
               } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Unable to set cookie', name, e);
               }
            };

            const cookieSource: any = data.cookies || data.tokens || data || {};
            const cookieKeys = ['jwt','jwt_auth_token','jwt_refresh_token','sessionid','lang','messages'];
            cookieKeys.forEach((k) => {
               const v = cookieSource[k] ?? cookieSource?.[k];
               if (v) {
                  setCookie(k, String(v), { maxAge: 60 * 60 * 24 * 30 });
                  try { localStorage.setItem(k, String(v)); } catch {}
               }
            });

            const primaryToken = cookieSource.token || cookieSource.access || cookieSource.access_token || cookieSource.jwt || cookieSource.jwt_auth_token || '';
            if (primaryToken) {
               try {
                  localStorage.setItem('jwt', String(primaryToken));
                  localStorage.setItem('token', String(primaryToken));
                  localStorage.setItem('jwt_auth_token', String(primaryToken));
                  setCookie('jwt_front', String(primaryToken), { maxAge: 60 * 60 * 24 * 30 });
               } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Unable to persist primary token', e);
               }
            }

            // Create user profile from response
            const userRaw = data.user || data.data || data.profile || data;
            const mapped: UserProfile = {
               id: userRaw?.id?.toString() || userRaw?.uuid || 'USR-' + Math.floor(Math.random() * 10000),
               name: userRaw?.name || userRaw?.username || firstName + ' ' + lastName,
               email: userRaw?.email || email,
               phone: userRaw?.phone,
               kycStatus: userRaw?.kycStatus || userRaw?.kyc_status || 'Unverified',
               tier: userRaw?.tier ?? 0,
               avatar: userRaw?.avatar || userRaw?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            };

            // After registration success, return user to login screen instead of auto-login
            setLoading(false);
            setMode('login');
         } catch (err: any) {
            console.error('Registration error', err);
            const errMsg = typeof err?.message === 'string' ? err.message : 'Network error during registration';
            setFormError(errMsg);
            setLoading(false);
         }

         return;
      }
   };

  const handleGoogleLogin = () => {
    setLoading(true);
      setTimeout(() => {
         const mockUser: UserProfile = {
            id: 'USR-' + Math.floor(Math.random() * 10000),
            name: email ? email.split('@')[0] : 'User',
            email,
            kycStatus: 'Unverified',
            tier: 0,
         };
         setLoading(false);
         onLogin(mockUser);
         onClose();
      }, 1000);
  };

   const subtitleText = mode === 'login' ? t('auth.enterCredentials') : '';
   const direction = i18n.dir();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Content with glassmorphism */}
      <div dir={direction} lang={i18n.language} className="relative bg-[#181920]/90 backdrop-blur-xl border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Image/Banner - Updated Background for Contrast */}
        <div className="h-32 bg-[#111218] relative overflow-hidden border-b border-white/5 flex-shrink-0">
           {/* Subtle mesh to keep it premium but dark */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-deti-primary/20 via-[#111218] to-[#111218]"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-deti-primary/10 rounded-full blur-3xl"></div>
           
           <div className="absolute top-1/2 -translate-y-1/2 left-8">
              <img src="https://i.postimg.cc/3Rj9YpjK/Group-83.png" alt="Logo" className="h-16 w-auto object-contain drop-shadow-lg" />
           </div>
           
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
              <X size={18} />
           </button>
        </div>

            <div className={`p-8 ${direction === 'rtl' ? 'text-right' : ''}`}>
                <div className="mb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}</h2>
                        {subtitleText && (
                           <p className="text-deti-subtext text-sm">{subtitleText}</p>
                        )}
                     </div>
                </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Row - Only visible during Registration */}
              {mode === 'register' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-deti-subtext uppercase ml-1">First Name <span className="text-red-400">*</span></label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
                      <input 
                        type="text" 
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-deti-subtext uppercase ml-1">Surname <span className="text-red-400">*</span></label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
                      <input 
                        type="text" 
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Date of Birth - Only visible during Registration */}
              {mode === 'register' && (
                <DobDatePicker
                  value={birthDay}
                  onChange={setBirthDay}
                  onValidationChange={setIsValidDob}
                />
              )}

              {/* Country Selection - Only visible during Registration */}
              {mode === 'register' && (
                <div className="space-y-1">
                   <label className="text-xs font-bold text-deti-subtext uppercase ml-1">Country of Residence</label>
                   <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all appearance-none cursor-pointer"
                      >
                         <option className="bg-[#181920]">United Arab Emirates</option>
                         <option className="bg-[#181920]">United States</option>
                         <option className="bg-[#181920]">United Kingdom</option>
                         <option className="bg-[#181920]">Vietnam</option>
                         <option className="bg-[#181920]">Singapore</option>
                         <option className="bg-[#181920]">Germany</option>
                         <option className="bg-[#181920]">Japan</option>
                         <option className="bg-[#181920]">Canada</option>
                         <option className="bg-[#181920]">Other</option>
                      </select>
                   </div>
                </div>
              )}

              <div className="space-y-1">
                 <label className="text-xs font-bold text-deti-subtext uppercase ml-1">{t('auth.emailAddress')} <span className="text-red-400">*</span></label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all"
                      placeholder="name@example.com"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-deti-subtext uppercase ml-1">{t('auth.password')} <span className="text-red-400">*</span></label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-deti-subtext hover:text-white"
                    >
                       {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                 </div>
              </div>

                     {/* Google reCAPTCHA - AFTER PASSWORD, BEFORE TERMS */}
                     {mode === 'register' && (
                        <div className="my-3">
                           <RecaptchaField
                              siteKey={recaptchaSiteKey}
                              onToken={(token) => {
                                 setCaptchaToken(token);
                                 setCaptchaError(null);
                              }}
                              error={captchaError || undefined}
                           />
                        </div>
                     )}

              {/* Terms & Conditions checkbox - Only visible during Registration */}
              {mode === 'register' && (
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-deti-primary cursor-pointer"
                    />
                    <span className="text-sm text-deti-subtext leading-relaxed">
                      I have read and agree to the{' '}
                      <a href="#" className="text-deti-primary hover:text-deti-secondary font-medium transition-colors" onClick={(e) => e.preventDefault()}>Terms & Conditions</a>
                      {' '}&{' '}
                      <a href="#" className="text-deti-primary hover:text-deti-secondary font-medium transition-colors" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={subscription}
                      onChange={(e) => setSubscription(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-deti-primary cursor-pointer"
                    />
                    <span className="text-sm text-deti-subtext leading-relaxed">
                      Subscribe to our Newsletter
                    </span>
                  </label>
                </div>
              )}

              {formError && (
                 <div className="mt-2 text-xs text-red-400">{formError}</div>
              )}

                       <button 
                         type="submit" 
                         disabled={loading || (mode === 'register' && (!agreeTerms || !isValidDob || !captchaToken))}
                         className="w-full py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:shadow-glow-gold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                       >
                          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                             <>
                                {mode === 'login' ? t('auth.loginAction') : t('auth.createAccount')} <ArrowRight size={18} />
                             </>
                          )}
                       </button>

              {mode === 'login' && (
                 <div className="flex justify-end mt-2">
                    <a href="#" className="text-xs text-deti-primary hover:text-deti-secondary font-medium transition-colors">{t('auth.forgotPassword')}</a>
                 </div>
              )}
           </form>

           <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-[#181920] px-4 text-xs text-deti-subtext rounded">{t('auth.continueWith')}</span>
           </div>

           <button 
             onClick={handleGoogleLogin}
             disabled={loading}
             className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 group"
           >
              {/* Google SVG */}
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
           </button>

           <div className="mt-6 text-center text-sm text-deti-subtext">
              {mode === 'login' ? `${t('auth.signUpPrompt')} ` : `${t('auth.signUpPrompt')} `}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-deti-primary font-bold hover:underline"
              >
                 {mode === 'login' ? t('auth.signUpAction') : t('auth.loginAction')}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
