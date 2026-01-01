import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

type Language = 'en' | 'vi' | 'ar';

export const LanguageSelector: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem('deti_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('deti_lang', language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    } catch (e) {
      console.warn('Failed to persist language', e);
    }
  }, [language]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="relative flex items-center gap-2">
      <Globe className="w-4 h-4 text-deti-subtext" />
      <select
        aria-label="Select language"
        value={language}
        onChange={handleChange}
        className="bg-deti-card text-xs text-deti-text rounded-md px-2 py-1.5 border border-deti-border hover:border-deti-primary/50 focus:border-deti-primary outline-none cursor-pointer transition-colors"
      >
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
};
