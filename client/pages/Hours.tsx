import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { Link } from 'wouter';
import { Clock, Phone, CalendarCheck, MapPin } from 'lucide-react';
import { getActiveLang } from '../lib/lang';
import racletteImg from '@assets/image_1785084864495-opt.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function Hours() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);

  const schedule = [
    { day: t('hours.mon'), time: null },
    { day: t('hours.tue'), time: null },
    { day: t('hours.wed'), time: '11:00 – 20:00' },
    { day: t('hours.thu'), time: '11:00 – 20:00' },
    { day: t('hours.fri'), time: '11:00 – 20:00' },
    { day: t('hours.sat'), time: '11:00 – 20:00' },
    { day: t('hours.sun'), time: '11:00 – 20:00' },
  ];

  const today = new Date().getDay(); // 0 = Sun, 1 = Mon …
  const scheduleIndex = today === 0 ? 6 : today - 1;

  const quickInfo = [
    {
      label: lang === 'de' ? 'Durchschnittspreis' : lang === 'it' ? 'Prezzo medio' : lang === 'fr' ? 'Prix moyen' : 'Average price',
      value: 'CHF 10–20',
      sub: lang === 'de' ? 'pro Person' : lang === 'it' ? 'a persona' : lang === 'fr' ? 'par personne' : 'per person',
    },
    {
      label: lang === 'de' ? 'Google-Bewertung' : lang === 'it' ? 'Valutazione Google' : lang === 'fr' ? 'Note Google' : 'Google rating',
      value: '★ 4.3 / 5',
      sub: lang === 'de' ? '52 echte Bewertungen' : lang === 'it' ? '52 recensioni autentiche' : lang === 'fr' ? '52 avis authentiques' : '52 genuine reviews',
    },
    {
      label: lang === 'de' ? 'Serviceangebot' : lang === 'it' ? 'Servizi' : lang === 'fr' ? 'Services' : 'Services',
      value: lang === 'de' ? 'Vor Ort & Takeaway' : lang === 'it' ? 'Sul posto & Asporto' : lang === 'fr' ? 'Sur place & Emporter' : 'Dine-in & Takeaway',
      sub: lang === 'de' ? 'Keine Lieferung' : lang === 'it' ? 'Consegna non disponibile' : lang === 'fr' ? 'Livraison non disponible' : 'No delivery',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('hours.title')} />

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-[#0c1a12] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-center items-center pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 text-center">
        <img 
          src={racletteImg} 
          alt="RHY Bistro horaires" 
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          width="1200"
          height="500"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 sm:mb-5 shadow-sm"
          >
            <Clock size={14} className="text-accent" />
            <span className="text-white/90 font-semibold tracking-widest uppercase text-[11px] sm:text-xs">
              RHY Bistro · Service & Accueil
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight drop-shadow-2xl mb-4 leading-[1.1]"
          >
            {t('hours.title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/85 font-serif italic max-w-2xl mx-auto mb-6 font-light leading-relaxed drop-shadow-md"
          >
            {lang === 'de'
              ? 'Mittagessen, Abendessen und gemütliche Genussmomente im Herzen von Etzgen.'
              : lang === 'it'
              ? 'Pranzo, cena e momenti conviviali nel cuore di Etzgen.'
              : lang === 'fr'
              ? 'Déjeuner, dîner et moments chaleureux au cœur d\'Etzgen.'
              : 'Lunch, dinner, and alpine gastronomic elegance in the heart of Etzgen.'}
          </motion.p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-accent/70" />
            <Clock size={18} className="text-accent" />
            <div className="w-12 h-px bg-accent/70" />
          </div>
        </div>
      </section>

      {/* ── QUICK INFO BAND ── */}
      <div className="bg-primary text-white py-5 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-light">
          <span className="flex items-center gap-2"><Clock size={15} className="text-accent" /> Wed – Sun : 11:00 – 20:00</span>
          <span className="hidden sm:block w-px h-5 bg-white/20" />
          <span className="flex items-center gap-2"><Phone size={15} className="text-accent" /> +41 79 425 16 66</span>
          <span className="hidden sm:block w-px h-5 bg-white/20" />
          <span className="flex items-center gap-2"><MapPin size={15} className="text-accent" /> Landstrasse 53, 5275 Etzgen</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* ── SCHEDULE TABLE ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            className="lg:col-span-3 bg-white rounded-sm border border-border shadow-sm overflow-hidden">
            <div className="bg-primary px-8 py-6">
              <h2 className="font-serif font-bold text-2xl text-white">
                {lang === 'de' ? 'Wochenübersicht' : lang === 'it' ? 'Orari della settimana' : lang === 'fr' ? 'Horaires de la semaine' : 'Weekly Schedule'}
              </h2>
              <p className="text-accent text-xs uppercase tracking-wider mt-1">Landstrasse 53, Etzgen</p>
            </div>

            <div className="divide-y divide-border">
              {schedule.map((item, i) => {
                const isToday = i === scheduleIndex;
                const isClosed = item.time === null;
                return (
                  <div key={item.day}
                    className={`flex items-center justify-between px-8 py-4 transition-colors ${
                      isToday ? 'bg-accent/10 font-semibold' : 'hover:bg-muted/30'
                    }`}>
                    <div className="flex items-center gap-3">
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                      )}
                      <span className={`text-base ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {item.day}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-sans font-medium">
                          {lang === 'de' ? 'Heute' : lang === 'it' ? 'Oggi' : lang === 'fr' ? 'Aujourd\'hui' : 'Today'}
                        </span>
                      )}
                    </div>
                    <div>
                      {isClosed ? (
                        <span className="text-muted-foreground text-sm italic">{t('hours.closed')}</span>
                      ) : (
                        <span className="font-mono text-sm text-foreground font-medium">{item.time}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-muted/20 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed italic">{t('hours.holidayNote')}</p>
            </div>
          </motion.div>

          {/* ── SIDE PANEL ── */}
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="lg:col-span-2 space-y-6">
            {quickInfo.map(info => (
              <div key={info.label} className="bg-white rounded-sm p-6 border border-border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{info.label}</p>
                <p className="font-serif font-bold text-2xl text-primary mb-1">{info.value}</p>
                <p className="text-xs text-muted-foreground font-light">{info.sub}</p>
              </div>
            ))}

            {/* CTA */}
            <div className="bg-primary rounded-sm p-8 text-white text-center space-y-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wider">RHY Bistro</p>
              <h3 className="font-serif font-bold text-2xl">
                {lang === 'de' ? 'Reservieren Sie Ihren Tisch' : lang === 'it' ? 'Prenota il tuo tavolo' : lang === 'fr' ? 'Réservez votre table' : 'Book your table'}
              </h3>
              <p className="text-white/70 text-sm font-light leading-relaxed">
                {lang === 'de'
                  ? 'Geniessen Sie vor Ort oder bestellen Sie Gerichte zum Mitnehmen.'
                  : lang === 'it'
                  ? 'Vieni a trovarci o ordina i tuoi piatti preferiti da asporto.'
                  : lang === 'fr'
                  ? 'Pour vos repas sur place ou vos commandes à emporter.'
                  : 'For dine-in meals or takeaway orders.'}
              </p>
              <div className="pt-2">
                <Link href="/reservation" data-testid="link-hours-reserve"
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 text-sm font-semibold rounded-sm hover:bg-accent/90 transition-all shadow-md">
                  <CalendarCheck size={16} />
                  {lang === 'de' ? 'Online reservieren' : lang === 'it' ? 'Prenota online' : lang === 'fr' ? 'Réserver en ligne' : 'Book Online'}
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
