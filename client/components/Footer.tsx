import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import logoImg from '@assets/bacchus-logo.png';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-white border-t-[6px] border-accent">
      <div className="container mx-auto px-4 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-flex items-center gap-4 group shrink-0" data-testid="footer-logo">
              <img
                src={logoImg}
                alt="Bacchus RHY Bistro"
                width="80"
                height="80"
                loading="lazy"
                decoding="async"
                className="h-16 sm:h-20 w-auto object-contain rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 shrink-0"
              />
              <div className="flex flex-col leading-none shrink-0">
                <span className="font-serif font-bold text-white text-2xl tracking-widest whitespace-nowrap">
                  BACCHUS
                </span>
                <span className="text-accent text-xs tracking-[0.22em] uppercase font-medium mt-1.5 whitespace-nowrap">
                  {t('nav.logoSub')}
                </span>
              </div>
            </Link>
            <p className="text-white/80 font-serif italic text-lg pr-4">
              "{t('footer.tagline')}"
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit BACCHUS on Instagram"
                className="text-white/60 hover:text-accent transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10"
                data-testid="social-instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit BACCHUS on Facebook"
                className="text-white/60 hover:text-accent transition-colors bg-white/5 p-3 rounded-full hover:bg-white/10"
                data-testid="social-facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Contact Col */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-xl font-semibold text-accent">{t('nav.contact')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 text-white/80 font-light">
                <MapPin size={20} className="shrink-0 mt-1 text-accent/80" />
                <span className="leading-relaxed">Landstrasse 53<br/>5275 Etzgen<br/>Switzerland</span>
              </div>
              <div className="flex items-center gap-4 text-white/80 font-light">
                <Phone size={20} className="shrink-0 text-accent/80" />
                <a href="tel:+41794251666" className="hover:text-accent transition-colors">+41 79 425 16 66</a>
              </div>
              <div className="flex items-center gap-4 text-white/80 font-light">
                <Mail size={20} className="shrink-0 text-accent/80" />
                <a href="mailto:info@rhybistro.ch" className="hover:text-accent transition-colors">info@rhybistro.ch</a>
              </div>
            </div>
          </div>

          {/* Hours Col */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-xl font-semibold text-accent">{t('home.hoursTitle')}</h3>
            <div className="text-white/80 font-light space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>{t('hours.mon')} - {t('hours.tue')}</span>
                <span className="text-accent font-medium uppercase text-sm tracking-wider">{t('hours.closed')}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>{t('hours.wed')} - {t('hours.sun')}</span>
                <span>11:00 - 20:00</span>
              </div>
            </div>
            <a
              href="https://goo.gl/maps/vrw1AtRktNZsfEbi9?g_st=aw"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:text-white transition-colors inline-flex items-center gap-2 mt-2 font-medium"
              data-testid="link-maps"
            >
              <MapPin size={16} /> {t('contact.openMap')}
            </a>
          </div>

          {/* Newsletter Col */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-xl font-semibold text-accent">{t('home.newsletterTitle')}</h3>
            <p className="text-sm text-white/80 font-light leading-relaxed">{t('home.newsletterDesc')}</p>
            <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="newsletter-email-input" className="sr-only">
                {t('home.emailPlaceholder')}
              </label>
              <Input 
                id="newsletter-email-input"
                type="email" 
                aria-label={t('home.emailPlaceholder')}
                placeholder={t('home.emailPlaceholder')} 
                className="rounded-r-none rounded-l-sm bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-accent h-12"
              />
              <Button
                type="submit"
                aria-label={t('home.subscribe')}
                className="rounded-l-none rounded-r-sm bg-accent text-primary hover:bg-white h-12 px-6 font-medium transition-colors"
              >
                {t('home.subscribe')}
              </Button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/50 font-light">
          <p>© {new Date().getFullYear()} RHY Bistro. {t('footer.rights')} 🇨🇭</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <Link href="/legal/privacy" className="hover:text-white transition-colors">{t('footer.legal.privacy')}</Link>
            <Link href="/legal/terms" className="hover:text-white transition-colors">{t('footer.legal.terms')}</Link>
            <Link href="/legal/impressum" className="hover:text-white transition-colors">{t('footer.legal.impressum')}</Link>
            <Link href="/admin/login" className="hover:text-accent transition-colors opacity-60 hover:opacity-100">Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
