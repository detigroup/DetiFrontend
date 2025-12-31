
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, Globe } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
   const [recaptchaChecked, setRecaptchaChecked] = useState(false);
   const [formError, setFormError] = useState<string | null>(null);
   const [language, setLanguage] = useState<'en'|'vi'|'ar'>(() => {
      try { return (localStorage.getItem('deti_lang') as any) || 'en'; } catch { return 'en'; }
   });

   const translations: Record<string, Record<string, string>> = {
      en: {
         signIn: 'Sign In',
         createAccount: 'Create Account',
         enterCredentials: 'Enter your credentials and verify the reCAPTCHA to enable the Sign In button.',
         emailAddress: 'Email Address',
         phoneNumber: 'Phone Number',
         password: 'Password',
         forgotPassword: 'Forgot Password?',
         verifyRecaptcha: 'Verify reCAPTCHA',
         imNotRobot: "I'M NOT A ROBOT",
         recaptchaRequired: "Please check 'I'M NOT A ROBOT' before signing in.",
         recaptchaHelper: 'Click Verify reCAPTCHA to enable Sign In.',
         continueWith: 'OR CONTINUE WITH',
         signUpPrompt: "Don't have an account?",
         signUpAction: 'Sign Up',
         loginAction: 'Log In',
         pleaseCheckToEnable: "Please check 'I'M NOT A ROBOT' to enable the Sign In button."
      },
      vi: {
         signIn: 'Đăng nhập',
         createAccount: 'Tạo tài khoản',
         enterCredentials: 'Nhập thông tin đăng nhập và xác minh reCAPTCHA để bật nút Đăng nhập.',
         emailAddress: 'Địa chỉ Email',
         phoneNumber: 'Số điện thoại',
         password: 'Mật khẩu',
         forgotPassword: 'Quên mật khẩu?',
         verifyRecaptcha: 'Xác minh reCAPTCHA',
         imNotRobot: 'TÔI KHÔNG PHẢI ROBOT',
         recaptchaRequired: "Vui lòng chọn 'TÔI KHÔNG PHẢI ROBOT' trước khi đăng nhập.",
         recaptchaHelper: 'Nhấn Xác minh reCAPTCHA để bật nút Đăng nhập.',
         continueWith: 'HOẶC TIẾP TỤC VỚI',
         signUpPrompt: 'Chưa có tài khoản?',
         signUpAction: 'Đăng ký',
         loginAction: 'Đăng nhập',
         pleaseCheckToEnable: "Vui lòng chọn 'TÔI KHÔNG PHẢI ROBOT' để bật nút Đăng nhập."
      },
      ar: {
         signIn: 'تسجيل الدخول',
         createAccount: 'إنشاء حساب',
         enterCredentials: 'أدخل بياناتك وقم بتأكيد reCAPTCHA لتمكين زر تسجيل الدخول.',
         emailAddress: 'البريد الإلكتروني',
         phoneNumber: 'رقم الهاتف',
         password: 'كلمة المرور',
         forgotPassword: 'هل نسيت كلمة المرور؟',
         verifyRecaptcha: 'التحقق من reCAPTCHA',
         imNotRobot: 'أنا لست روبوتًا',
         recaptchaRequired: "يرجى تحديد 'أنا لست روبوتًا' قبل تسجيل الدخول.",
         recaptchaHelper: 'انقر فوق التحقق من reCAPTCHA لتمكين تسجيل الدخول.',
         continueWith: 'أو المتابعة عبر',
         signUpPrompt: 'ليس لديك حساب؟',
         signUpAction: 'اشتراك',
         loginAction: 'تسجيل الدخول',
         pleaseCheckToEnable: "يرجى تحديد 'أنا لست روبوتًا' لتمكين زر تسجيل الدخول."
      }
   };

   const t = (key: string) => (translations[language] && translations[language][key]) || translations['en'][key];

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United Arab Emirates');

   // Reset recaptcha state when method or modal is reopened (do NOT reset while typing password)
   useEffect(() => {
      setRecaptchaChecked(false);
      setFormError(null);
   }, [method, isOpen]);

   // Persist language selection
   useEffect(() => {
      try { localStorage.setItem('deti_lang', language); } catch {}
      // set document dir for proper directionality when modal is open
      if (isOpen) {
         document.documentElement.lang = language;
         document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      }
   }, [language, isOpen]);

  if (!isOpen) return null;

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setLoading(true);

      if (mode === 'login') {
         if (!recaptchaChecked) {
            setFormError(t('recaptchaRequired'));
            setLoading(false);
            return;
         }

         try {
            const domain = ((import.meta as any)?.env?.VITE_API_DOMAIN) || 'https://detidex.yeuthich.net';
            const apiPath = ((import.meta as any)?.env?.VITE_LOGIN_API) || '/api/v1/auth/login/';
            const url = `${domain.replace(/\/$/, '')}${apiPath}`;

            const payload: Record<string, any> = {
               password,
               recaptcha: recaptchaChecked,
            };
            if (method === 'email') payload.email = email;
            if (method === 'phone') payload.phone = phone;

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
               const msg = data?.message || data?.error || `Login failed (status ${res.status})`;
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
               name: userRaw?.name || userRaw?.username || (email ? email.split('@')[0] : `User ${phone.slice(-4)}`),
               email: userRaw?.email || (method === 'email' ? email : undefined),
               phone: userRaw?.phone || (method === 'phone' ? phone : undefined),
               kycStatus: userRaw?.kycStatus || userRaw?.kyc_status || 'Unverified',
               tier: userRaw?.tier ?? 0,
               avatar: userRaw?.avatar || userRaw?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            };

            setLoading(false);
            onLogin(mapped);
            onClose();
         } catch (err: any) {
            console.error('Login error', err);
            setFormError(err?.message || 'Network error during login');
            setLoading(false);
         }

         return;
      }

      // Registration / fallback: keep mock behaviour
      setTimeout(() => {
         const mockUser: UserProfile = {
            id: 'USR-' + Math.floor(Math.random() * 10000),
            name: method === 'email' ? email.split('@')[0] : 'User ' + phone.slice(-4),
            email: method === 'email' ? email : undefined,
            phone: method === 'phone' ? phone : undefined,
            kycStatus: 'Unverified',
            tier: 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
         };
         setLoading(false);
         onLogin(mockUser);
         onClose();
      }, 1500);
   };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
       const mockUser: UserProfile = {
        id: 'GOOG-' + Math.floor(Math.random() * 10000),
        name: 'Google User',
        email: 'user@gmail.com',
        kycStatus: 'Unverified',
        tier: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Google'
      };
      setLoading(false);
      onLogin(mockUser);
      onClose();
    }, 2000);
  };

   const subtitleText = mode === 'login' ? '' : "Join the world's premium crypto exchange.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Content with glassmorphism */}
      <div dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} className="relative bg-[#181920]/90 backdrop-blur-xl border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Image/Banner - Updated Background for Contrast */}
        <div className="h-32 bg-[#111218] relative overflow-hidden border-b border-white/5">
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

            <div className={`p-8 ${language === 'ar' ? 'text-right' : ''}`}>
                <div className="mb-6 flex items-start justify-between gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{mode === 'login' ? t('signIn') : t('createAccount')}</h2>
                        {subtitleText && (
                           <p className="text-deti-subtext text-sm">{subtitleText}</p>
                        )}
                     </div>
                     <div className="flex items-center gap-3">
                        <select aria-label="Select language" value={language} onChange={(e) => setLanguage(e.target.value as any)} className="bg-white/5 text-xs text-white rounded-md px-2 py-1 border border-white/10">
                           <option value="en">English</option>
                           <option value="vi">Tiếng Việt</option>
                           <option value="ar">العربية</option>
                        </select>
                     </div>
                </div>

           {/* Method Tabs - Updated Active Color */}
           <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
              <button 
                onClick={() => setMethod('email')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${method === 'email' ? 'bg-deti-primary text-white shadow-glow' : 'text-deti-subtext hover:text-white'}`}
              >
                Email
              </button>
              <button 
                onClick={() => setMethod('phone')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${method === 'phone' ? 'bg-deti-primary text-white shadow-glow' : 'text-deti-subtext hover:text-white'}`}
              >
                Phone
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              
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

              {method === 'email' ? (
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-deti-subtext uppercase ml-1">{t('emailAddress')}</label>
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
              ) : (
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-deti-subtext uppercase ml-1">{t('phoneNumber')}</label>
                    <div className="relative group">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-deti-subtext group-focus-within:text-deti-primary transition-colors" />
                       <input 
                         type="tel" 
                         required
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-deti-primary outline-none transition-all"
                         placeholder="+1 234 567 8900"
                       />
                    </div>
                 </div>
              )}

              <div className="space-y-1">
                 <label className="text-xs font-bold text-deti-subtext uppercase ml-1">{t('password')}</label>
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
                        {/* reCAPTCHA checkbox always visible in login mode */}
                        {mode === 'login' && (
                           <div className="mt-3 flex items-center gap-3">
                              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                 <input
                                    type="checkbox"
                                    checked={recaptchaChecked}
                                    onChange={(e) => setRecaptchaChecked(e.target.checked)}
                                    className="w-4 h-4 accent-deti-primary"
                                 />
                                 <span className="font-medium select-none">{t('imNotRobot')}</span>
                              </label>
                           </div>
                        )}

                       {formError && (
                          <div className="mt-2 text-xs text-red-400">{formError}</div>
                       )}

                       <button 
                         type="submit" 
                         disabled={loading || (mode === 'login' && !recaptchaChecked)}
                         className="w-full py-3 bg-gradient-brand text-white rounded-xl font-bold shadow-glow hover:shadow-glow-gold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                       >
                          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                             <>
                                {mode === 'login' ? t('loginAction') : t('createAccount')} <ArrowRight size={18} />
                             </>
                          )}
                       </button>

              {mode === 'login' && (
                 <div className="flex justify-end mt-2">
                    <a href="#" className="text-xs text-deti-primary hover:text-deti-secondary font-medium transition-colors">{t('forgotPassword')}</a>
                 </div>
              )}
           </form>

           <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-[#181920] px-4 text-xs text-deti-subtext rounded">{t('continueWith')}</span>
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
              {mode === 'login' ? `${t('signUpPrompt')} ` : `${t('signUpPrompt')} `}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-deti-primary font-bold hover:underline"
              >
                 {mode === 'login' ? t('signUpAction') : t('loginAction')}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
