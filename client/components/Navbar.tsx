import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@assets/bacchus-logo.png';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/menu', label: t('nav.menu') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0f2419]/97 backdrop-blur-md shadow-lg shadow-black/30 py-3 border-b border-white/10'
            : 'bg-[#0f2419]/75 backdrop-blur-sm py-4 border-b border-white/5'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 sm:gap-8">

          {/* Logo — image + text shown completely & clearly with no overlap */}
          <Link href="/" data-testid="link-logo" className="shrink-0 group flex items-center gap-3 sm:gap-4 select-none">
            <img
              src={logoImg}
              alt="Bacchus RHY Bistro"
              width="64"
              height="64"
              decoding="async"
              className="h-12 sm:h-14 lg:h-16 w-auto max-w-none object-contain rounded-lg drop-shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <div className="shrink-0 flex flex-col leading-none justify-center">
              <span className="font-serif font-bold text-white text-base sm:text-xl tracking-widest drop-shadow-sm whitespace-nowrap">
                BACCHUS
              </span>
              <span className="text-accent text-[0.62rem] sm:text-[0.7rem] tracking-[0.22em] uppercase font-medium mt-1 whitespace-nowrap">
                {t('nav.logoSub')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((link) => {
              const active = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-200 group ${
                    active ? 'text-accent' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {link.label}
                  {/* Gold underline indicator */}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1.5px] bg-accent rounded-full transition-all duration-300 ${
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher />
            <Link
              href="/reservation"
              data-testid="link-reservation-cta"
              className="px-5 py-2 rounded-sm bg-accent text-[#1c1c1c] text-sm font-semibold tracking-wide hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow shadow-accent/30"
            >
              {t('nav.book')}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2.5">
            <LanguageSwitcher />
            <button
              className="p-2 text-white hover:text-accent rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
              data-testid="button-mobile-menu-open"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[60] bg-[#0f2419] flex flex-col"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 shrink-0">
                <img
                  src={logoImg}
                  alt="Bacchus RHY Bistro"
                  width="48"
                  height="48"
                  decoding="async"
                  className="h-12 w-auto object-contain rounded-lg drop-shadow-md shrink-0"
                />
                <div className="leading-none shrink-0">
                  <div className="font-serif font-bold text-lg text-white tracking-widest whitespace-nowrap">BACCHUS</div>
                  <div className="text-[0.6rem] tracking-[0.22em] uppercase text-accent font-medium mt-1 whitespace-nowrap">
                    {t('nav.logoSub')}
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  aria-label="Close Menu"
                  data-testid="button-mobile-menu-close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Mobile links */}
            <nav className="flex-1 flex flex-col justify-start px-8 pt-6 pb-8 overflow-y-auto gap-1">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 text-2xl font-serif border-b border-white/10 transition-colors ${
                      location === link.href ? 'text-accent italic' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + links.length * 0.04 }}
              >
                <Link
                  href="/reservation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mt-6 text-center py-3 rounded-sm bg-accent text-[#1c1c1c] font-semibold tracking-wide text-lg"
                >
                  {t('nav.book')}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
