import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { SEO } from '../components/SEO';
import { team } from '../data/team';
import { Award, Heart, Sparkles, UtensilsCrossed, CalendarCheck } from 'lucide-react';
import { getActiveLang } from '../lib/lang';

import platterImg from '@assets/image_1785084872921-opt.jpg';
import racletteImg from '@assets/image_1785084864495-opt.jpg';
import fondueImg from '@assets/image_1785084917216-opt.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12 } }),
};

export default function About() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);

  const getTeamRole = (member: any) => {
    if (lang === 'de') return member.roleDe || member.roleEn || member.roleFr;
    if (lang === 'it') return member.roleIt || member.roleFr || member.roleEn;
    if (lang === 'en') return member.roleEn || member.roleFr;
    return member.roleFr || member.roleEn;
  };

  const getTeamBio = (member: any) => {
    if (lang === 'de') return member.bioDe || member.bioEn || member.bioFr;
    if (lang === 'it') return member.bioIt || member.bioFr || member.bioEn;
    if (lang === 'en') return member.bioEn || member.bioFr;
    return member.bioFr || member.bioEn;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('nav.about')} />

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-[#0c1a12] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-center items-center pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 text-center">
        <img 
          src={platterImg} 
          alt="RHY Bistro Histoire & Terroir" 
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
            <Sparkles size={14} className="text-accent" />
            <span className="text-white/90 font-semibold tracking-widest uppercase text-[11px] sm:text-xs">
              RHY Bistro · Etzgen, Switzerland
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white drop-shadow-2xl mb-4 tracking-tight leading-[1.1]"
          >
            {t('about.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/85 font-serif italic max-w-2xl mx-auto mb-6 font-light leading-relaxed drop-shadow-md"
          >
            {lang === 'de'
              ? 'Leidenschaft für alpine Kulinarik, gelebte Handwerkskunst und familiäre Gastfreundschaft.'
              : lang === 'it'
              ? 'Passione per la cucina alpina, rispetto per il territorio e calda ospitalità.'
              : lang === 'fr'
              ? 'Passion de la cuisine alpine, respect du terroir et hospitalité sincère.'
              : 'A deep passion for alpine cuisine, regional terroir, and heartfelt Swiss hospitality.'}
          </motion.p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-accent/70" />
            <span className="text-accent text-xl">❧</span>
            <div className="w-12 h-px bg-accent/70" />
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-6">
              <h2 className="text-4xl font-serif font-bold text-primary">
                {lang === 'de' ? 'Zurück zu den Wurzeln' : lang === 'it' ? 'Ritorno alle origini' : lang === 'fr' ? 'Retour aux sources' : 'Back to the roots'}
              </h2>
              <div className="w-14 h-1 bg-accent rounded-full" />
              <p className="text-lg text-foreground/80 leading-relaxed font-light">{t('about.chefBio')}</p>
              <p className="text-foreground/70 leading-relaxed font-light">
                {lang === 'de'
                  ? 'Jeder Teller erzählt eine Geschichte: von alpinen Weiden, duftenden Nadelwäldern und lokalen Erzeugern. Wir glauben an Speisen, die das Herz erwärmen, serviert mit der Eleganz der Haute Cuisine.'
                  : lang === 'it'
                  ? 'Ogni piatto racconta una storia: quella dei pascoli alpini, delle foreste di pini e dei produttori locali. Crediamo in una cucina che scalda il cuore, servita con l’eleganza dell’alta ristorazione.'
                  : lang === 'fr'
                  ? 'Chaque assiette raconte une histoire : celle des alpages, des forêts de sapins, et des artisans locaux. Nous croyons en une cuisine qui réchauffe le cœur, servie avec l\'élégance des grandes tables.'
                  : 'Every plate tells a story: of the alpine pastures, pine forests, and local artisans. We believe in food that warms the heart, served with the elegance of fine dining.'}
              </p>
              <p className="text-foreground/70 leading-relaxed font-light">{t('home.intro')}</p>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border mt-6">
                <div>
                  <p className="font-serif font-bold text-4xl text-accent mb-1">15+</p>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {lang === 'de' ? 'Regionale Produzenten' : lang === 'it' ? 'Produttori locali' : lang === 'fr' ? 'Producteurs locaux' : 'Local producers'}
                  </p>
                </div>
                <div>
                  <p className="font-serif font-bold text-4xl text-accent mb-1">100%</p>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {lang === 'de' ? 'Hausgemacht' : lang === 'it' ? 'Fatto in casa' : lang === 'fr' ? 'Fait maison' : 'Homemade'}
                  </p>
                </div>
              </div>

              <Link href="/reservation" data-testid="link-about-reserve"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-sm font-semibold tracking-wide hover:bg-primary/90 transition-colors rounded-sm mt-2">
                <CalendarCheck size={16} />
                {t('home.bookTable')}
              </Link>
            </motion.div>

            {/* Image stack */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="rounded-sm overflow-hidden shadow-2xl border-4 border-white aspect-[4/5]">
                  <img src={racletteImg} alt="Raclette RHY Bistro" width="400" height="500" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-sm overflow-hidden shadow-xl border-4 border-white hidden sm:block">
                  <img src={fondueImg} alt="Fondue RHY Bistro" width="176" height="176" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full -z-10 blur-xl" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-accent uppercase tracking-widest text-xs font-semibold mb-2">RHY Bistro</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">{t('about.valuesTitle')}</h2>
            <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="bg-white rounded-sm p-8 border border-border shadow-sm text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <UtensilsCrossed size={26} />
              </div>
              <h3 className="font-serif font-bold text-xl text-primary mb-3">{t('home.why.sourcing')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">{t('home.why.sourcingDesc')}</p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="bg-white rounded-sm p-8 border border-border shadow-sm text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Award size={26} />
              </div>
              <h3 className="font-serif font-bold text-xl text-primary mb-3">{t('home.why.craft')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">{t('home.why.craftDesc')}</p>
            </motion.div>

            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="bg-white rounded-sm p-8 border border-border shadow-sm text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Heart size={26} />
              </div>
              <h3 className="font-serif font-bold text-xl text-primary mb-3">{t('home.why.hospitality')}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light">{t('home.why.hospitalityDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-accent uppercase tracking-widest text-xs font-semibold mb-2">Passion & Savoir-faire</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">{t('about.teamTitle')}</h2>
            <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member: any, i: number) => (
              <motion.div key={member.id} variants={fadeUp} custom={i * 0.5} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-white rounded-sm p-8 border border-border text-center hover:border-accent/50 hover:shadow-lg transition-all group">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 mb-5 flex items-center justify-center border-[3px] border-accent/20 group-hover:border-accent transition-colors">
                  <span className="font-serif text-2xl text-primary font-bold">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-primary mb-1">{member.name}</h3>
                <p className="text-accent text-xs font-semibold mb-3 uppercase tracking-wider">
                  {getTeamRole(member)}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">
                  {getTeamBio(member)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BADGE STRIP ── */}
      <section className="bg-primary text-white py-10 border-t-4 border-accent">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 text-sm">
            <span className="font-serif text-xl tracking-widest uppercase">RHY Bistro</span>
            <span className="hidden md:block w-px h-6 bg-white/20" />
            <span className="flex items-center gap-2 text-white/80"><Sparkles size={14} className="text-accent" />
              {lang === 'de' ? 'Schweizer Gastronomie' : lang === 'it' ? 'Gastronomia Svizzera' : lang === 'fr' ? 'Gastronomie suisse' : 'Swiss Gastronomy'}
            </span>
            <span className="hidden md:block w-px h-6 bg-white/20" />
            <span className="flex items-center gap-2 text-white/80"><Sparkles size={14} className="text-accent" />
              {lang === 'de' ? 'AOP-Käse & Walliser Weine' : lang === 'it' ? 'Formaggi AOP e Vini del Vallese' : lang === 'fr' ? 'Fromages AOP & Vins du Valais' : 'AOP Cheeses & Valais Wines'}
            </span>
            <span className="hidden md:block w-px h-6 bg-white/20" />
            <span className="flex items-center gap-2 text-white/80"><Sparkles size={14} className="text-accent" />
              {lang === 'de' ? 'Etzgen, Schweiz' : lang === 'it' ? 'Etzgen, Svizzera' : 'Etzgen, Suisse'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
