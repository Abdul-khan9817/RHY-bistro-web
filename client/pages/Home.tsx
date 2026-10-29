import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { ArrowRight, UtensilsCrossed, Leaf, HeartHandshake, Instagram, ChevronDown, Camera } from 'lucide-react';
import { menu } from '../data/menu';
import { CustomerReviews } from '../components/CustomerReviews';

import racletteImg from '@assets/image_1785084864495-opt.jpg';
import fondueImg from '@assets/image_1785084917216-opt.jpg';
import platterImg from '@assets/image_1785084872921-opt.jpg';
import flammkuchenImg from '@assets/image_1785084845728-opt.jpg';
import food5Img from '@assets/image_1785084930701-opt.jpg';
import food6Img from '@assets/image_1785084947299-opt.jpg';

import { getActiveLang } from '../lib/lang';

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);

  const signatureDishes = [
    { ...menu.find(item => item.id === '8'), img: fondueImg },
    { ...menu.find(item => item.id === '4'), img: racletteImg },
    { ...menu.find(item => item.id === '2'), img: platterImg },
  ];

  return (
    <div className="w-full">
      <SEO title={t('nav.home')} />

      {/* A. HERO */}
      <section className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#0c1a12]">
        <img
          src={racletteImg}
          alt="BACCHUS Alpine Culinary Ambience"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width="1200"
          height="800"
          className="absolute inset-0 z-0 w-full h-full object-cover scale-105 transition-transform duration-1000"
        />
        {/* Multi-layered Vignette Overlay for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/80 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-0" />
        
        {/* Main Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full pt-28 pb-12 sm:pt-32 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 sm:mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-white/90 font-medium tracking-widest uppercase text-[11px] sm:text-xs">
                {t('home.eyebrow')}
              </p>
            </div>

            {/* Main Grand Title */}
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-3 sm:mb-5 drop-shadow-2xl tracking-tight leading-[1.05]">
              RHY Bistro
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-2xl md:text-3xl text-accent font-serif italic mb-8 sm:mb-10 max-w-2xl mx-auto drop-shadow-md font-light leading-snug">
              {t('home.tagline')}
            </p>
            
            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 w-full sm:w-auto justify-center max-w-md sm:max-w-none">
              <Link href="/reservation" className="w-full sm:w-auto" data-testid="link-hero-reserve">
                <Button size="lg" className="w-full sm:w-auto bg-accent text-white hover:bg-accent/90 text-sm sm:text-base h-12 sm:h-14 px-8 sm:px-10 transition-all font-semibold rounded-full shadow-lg hover:shadow-accent/30">
                  {t('home.bookTable')}
                </Button>
              </Link>
              <Link href="/menu" className="w-full sm:w-auto" data-testid="link-hero-menu">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary text-sm sm:text-base h-12 sm:h-14 px-8 sm:px-10 transition-all font-medium rounded-full">
                  {t('home.viewMenu')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Pinned Info Strip */}
        <div className="relative z-10 w-full bg-black/75 backdrop-blur-md border-t border-white/15 py-3 sm:py-4">
          <div className="container mx-auto px-4 sm:px-6 flex flex-wrap justify-center sm:justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-accent font-bold text-sm sm:text-base">★ 4.3</span>
              <span className="text-white/70">(52 reviews)</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/20" />
            <div className="font-light">CHF 10–20 / pers.</div>
            <div className="hidden md:block w-px h-4 bg-white/20" />
            <div className="font-light">Wed–Sun 11:00–20:00</div>
            <div className="hidden md:block w-px h-4 bg-white/20" />
            <a href="tel:+41794251666" className="text-accent font-medium hover:underline transition-colors">
              +41 79 425 16 66
            </a>
          </div>
        </div>
      </section>

      {/* B. WELCOME STRIP */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <p className="text-2xl md:text-3xl font-serif text-primary leading-relaxed">
              "{t('home.intro')}"
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="w-12 h-px bg-accent/50" />
              <span className="text-accent text-xl">❧</span>
              <div className="w-12 h-px bg-accent/50" />
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 max-w-5xl mx-auto border-t border-border pt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 group"
            >
              <Leaf size={28} className="text-accent" />
              <span className="font-serif text-xl text-primary font-medium">{t('home.why.sourcing')}</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 group"
            >
              <UtensilsCrossed size={28} className="text-accent" />
              <span className="font-serif text-xl text-primary font-medium">{t('home.why.craft')}</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 group"
            >
              <HeartHandshake size={28} className="text-accent" />
              <span className="font-serif text-xl text-primary font-medium">{t('home.why.hospitality')}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* C. SIGNATURE DISHES */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">{t('home.ourMenu')}</h2>
            <div className="w-24 h-1 bg-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {signatureDishes.map((dish, i) => dish && (
              <Link key={dish.id} href="/menu" className="group block" data-testid={`link-dish-${dish.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background rounded-sm overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col hover:border-b-2 hover:border-b-accent"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden relative">
                    {(() => {
                      const name = lang === 'de' ? (dish.nameDe || dish.nameEn || dish.nameFr) : lang === 'it' ? (dish.nameIt || dish.nameFr || dish.nameEn) : lang === 'fr' ? dish.nameFr : dish.nameEn;
                      const desc = lang === 'de' ? (dish.descDe || dish.descEn || dish.descFr) : lang === 'it' ? (dish.descIt || dish.descFr || dish.descEn) : lang === 'fr' ? dish.descFr : dish.descEn;
                      return (
                        <>
                          <img 
                            src={dish.img} 
                            alt={name} 
                            loading="lazy"
                            decoding="async"
                            width="400"
                            height="300"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    {(() => {
                      const name = lang === 'de' ? (dish.nameDe || dish.nameEn || dish.nameFr) : lang === 'it' ? (dish.nameIt || dish.nameFr || dish.nameEn) : lang === 'fr' ? dish.nameFr : dish.nameEn;
                      const desc = lang === 'de' ? (dish.descDe || dish.descEn || dish.descFr) : lang === 'it' ? (dish.descIt || dish.descFr || dish.descEn) : lang === 'fr' ? dish.descFr : dish.descEn;
                      return (
                        <>
                          <div className="flex justify-between items-start mb-4 gap-4">
                            <h3 className="text-2xl font-serif font-bold text-primary leading-tight">
                              {name}
                            </h3>
                            <span className="bg-accent/10 text-accent font-semibold px-3 py-1 text-sm whitespace-nowrap rounded-sm">
                              CHF {dish.price}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed mt-auto">
                            {desc}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/menu" className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors font-serif text-xl" data-testid="link-full-menu">
              {t('home.fullMenu')}
            </Link>
          </div>
        </div>
      </section>

      {/* D. ABOUT TEASER */}
      <section className="py-0 flex flex-col lg:flex-row w-full min-h-[600px]">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 bg-primary text-white p-12 lg:p-24 flex flex-col justify-center relative"
        >
          <h2 className="text-4xl lg:text-5xl font-serif mb-8">{t('home.ourHistory')}</h2>
          <div className="w-16 h-1 bg-accent mb-10" />
          
          <div className="space-y-6 text-white/80 text-lg font-light leading-relaxed mb-12">
            <p>{t('home.storyText1')}</p>
            <p>{t('home.storyText2')}</p>
            <p>{t('home.storyText3')}</p>
          </div>

          <Link href="/about" className="inline-flex items-center gap-2 text-accent font-medium hover:text-white transition-colors" data-testid="link-about-teaser">
            {t('home.learnMore')}
          </Link>
          
          {/* Gold vertical rule divider */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-accent z-10" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="lg:w-1/2 min-h-[400px] lg:min-h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${platterImg})` }}
        />
      </section>

      {/* E. RESERVATION CTA BAND */}
      <section className="relative py-32 w-full overflow-hidden flex items-center justify-center text-center">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${flammkuchenImg})` }}
        />
        <div className="absolute inset-0 bg-black/80 z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 px-4 max-w-3xl flex flex-col items-center"
        >
          <p className="text-accent tracking-[0.2em] uppercase text-sm mb-4">{t('home.reserveEyebrow')}</p>
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-8">{t('home.reserveTitle')}</h2>
          <p className="text-white/80 text-xl mb-12 font-light">
            +41 79 425 16 66 <span className="mx-4">|</span> info@rhybistro.ch
          </p>
          <Link href="/reservation" data-testid="link-band-reserve">
            <Button size="lg" className="bg-accent text-white hover:bg-white hover:text-primary text-lg h-16 px-12 transition-all rounded-sm font-serif">
              {t('home.reserveCTA')}
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* F. CUSTOMER REVIEWS */}
      <CustomerReviews />

      {/* G. GALLERY STRIP */}
      <section className="py-0 border-t border-border">
        <div className="py-16 text-center bg-white">
          <h2 className="text-3xl font-serif font-bold text-primary mb-4">{t('gallery.title')}</h2>
          <div className="w-12 h-1 bg-accent mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
          {[fondueImg, racletteImg, platterImg, flammkuchenImg, food5Img, food6Img].map((src, i) => (
            <Link key={i} href="/gallery" className="relative aspect-square overflow-hidden group block bg-primary" data-testid={`link-gallery-strip-${i}`}>
              <img
                src={src}
                alt="BACCHUS culinary experience gallery"
                loading="lazy"
                decoding="async"
                width="300"
                height="300"
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Camera className="text-white" size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* H. INFO FOOTER BAND */}
      <section className="py-12 bg-primary border-t border-white/10 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-accent/30 text-center">
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="font-serif text-accent mb-2">{t('contact.address')}</span>
              <span className="font-light">Landstrasse 53<br/>5275 Etzgen, Switzerland</span>
              <a href="https://goo.gl/maps/vrw1AtRktNZsfEbi9?g_st=aw" target="_blank" rel="noreferrer" className="text-sm mt-3 border-b border-white/30 hover:border-accent text-white/70 hover:text-accent transition-colors">Google Maps</a>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="font-serif text-accent mb-2">{t('home.hoursTitle')}</span>
              <span className="font-light">Wed–Sun 11:00–20:00<br/>Mon–Tue Closed</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="font-serif text-accent mb-2">{t('contact.title')}</span>
              <a href="tel:+41794251666" className="font-light hover:text-accent transition-colors">+41 79 425 16 66</a>
              <a href="mailto:info@rhybistro.ch" className="font-light hover:text-accent transition-colors mt-1">info@rhybistro.ch</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
