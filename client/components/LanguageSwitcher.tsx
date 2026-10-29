import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { getActiveLang, SupportedLang } from '../lib/lang';

interface LanguageOption {
  code: SupportedLang;
  label: string;
  name: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'it', label: 'IT', name: 'Italiano' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLang = (lang: SupportedLang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('rhy-bistro-lang', lang);
    setIsOpen(false);
  };

  const currentLang = getActiveLang(i18n);
  const activeOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button: Globe + Selected Language + Chevron */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="language-switcher-trigger"
        className="flex items-center gap-1.5 bg-[#0b1b13]/85 hover:bg-[#142e20] active:scale-95 transition-all duration-200 px-2.5 py-1.5 rounded-full border border-white/15 text-xs font-medium text-white shadow-inner cursor-pointer select-none"
        aria-label={`Current language: ${activeOption.name}. Click to change language.`}
      >
        <Globe size={13} className="text-accent flex-shrink-0" />
        <span className="font-bold tracking-wider text-accent text-[11px]">
          {activeOption.label}
        </span>
        <ChevronDown
          size={12}
          className={`text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-36 rounded-lg bg-[#0e2217] border border-white/20 shadow-2xl shadow-black/60 py-1 z-[100] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => toggleLang(lang.code)}
                data-testid={`lang-${lang.code}`}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'text-accent font-semibold bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wider text-[11px]">{lang.label}</span>
                  <span className="text-[11px] text-white/50">{lang.name}</span>
                </div>
                {isActive && <Check size={13} className="text-accent ml-2 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
