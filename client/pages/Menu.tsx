import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { SEO } from '../components/SEO';
import { menu as staticMenu, MenuItemType } from '../data/menu';
import { getActiveLang, SupportedLang } from '../lib/lang';
import { 
  Wine, 
  UtensilsCrossed, 
  Sparkles, 
  Search, 
  X, 
  Calendar, 
  Leaf, 
  Flame, 
  Info, 
  ChevronRight, 
  Coffee, 
  Cake,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../components/ui/button';

import fondueImg from '@assets/image_1785084917216-opt.jpg';
import racletteImg from '@assets/image_1785084864495-opt.jpg';
import platterImg from '@assets/image_1785084872921-opt.jpg';
import flammkuchenImg from '@assets/image_1785084845728-opt.jpg';
import meatImg from '@assets/image_1785084930701-opt.jpg';
import barImg from '@assets/image_1785084947299-opt.jpg';

const ITEM_IMAGES: Record<string, string> = {
  '8': fondueImg,
  '27': racletteImg,
  '4': platterImg,
  '2': platterImg,
  '7': meatImg,
  '6': meatImg,
  '28': flammkuchenImg,
  '11': fondueImg,
  '14': racletteImg,
  '21': barImg,
  '23': barImg,
};

export default function Menu() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);

  const [menuItems, setMenuItems] = useState<MenuItemType[]>(staticMenu);
  const [activeTab, setActiveTab] = useState<string>('starters');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'vegan' | 'gf' | 'special'>('all');

  // Try to load dynamic items from API if available
  useEffect(() => {
    let isMounted = true;
    fetch('/api/menu')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((json) => {
        if (isMounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setMenuItems(json.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const getItemName = (item: MenuItemType) => {
    if (lang === 'de') return item.nameDe || item.nameEn || item.nameFr;
    if (lang === 'it') return item.nameIt || item.nameFr || item.nameEn;
    if (lang === 'en') return item.nameEn || item.nameFr;
    return item.nameFr || item.nameEn;
  };

  const getItemDesc = (item: MenuItemType) => {
    if (lang === 'de') return item.descDe || item.descEn || item.descFr;
    if (lang === 'it') return item.descIt || item.descFr || item.descEn;
    if (lang === 'en') return item.descEn || item.descFr;
    return item.descFr || item.descEn;
  };

  const getItemPairing = (item: MenuItemType) => {
    if (lang === 'de') return item.pairingDe || item.pairingEn || item.pairingFr;
    if (lang === 'it') return item.pairingIt || item.pairingFr || item.pairingEn;
    if (lang === 'en') return item.pairingEn || item.pairingFr;
    return item.pairingFr || item.pairingEn;
  };

  const getWineTypeLabel = (wineType?: string) => {
    if (wineType === 'white') {
      if (lang === 'de') return 'Weisswein';
      if (lang === 'it') return 'Vino Bianco';
      if (lang === 'en') return 'White Wine';
      return 'Vin Blanc';
    }
    if (wineType === 'red') {
      if (lang === 'de') return 'Rotwein';
      if (lang === 'it') return 'Vino Rosso';
      if (lang === 'en') return 'Red Wine';
      return 'Vin Rouge';
    }
    if (wineType === 'sparkling') {
      if (lang === 'de') return 'Schaumwein & Champagner';
      if (lang === 'it') return 'Bollicine & Champagne';
      if (lang === 'en') return 'Sparkling & Champagne';
      return 'Bulles & Champagne';
    }
    return '';
  };

  const categories = useMemo(() => [
    { id: 'starters', label: t('menu.categories.starters'), icon: UtensilsCrossed },
    { id: 'mains',    label: t('menu.categories.mains'), icon: Flame },
    { id: 'desserts', label: t('menu.categories.desserts'), icon: Cake },
    { id: 'drinks',   label: t('menu.categories.drinks'), icon: Coffee },
    { id: 'wine',     label: t('menu.categories.wine'), icon: Wine },
  ], [t]);

  // Scroll spy for active tab
  useEffect(() => {
    if (searchQuery.trim() || dietaryFilter !== 'all') return;

    const onScroll = () => {
      const scrollY = window.scrollY + 200;
      for (let i = categories.length - 1; i >= 0; i--) {
        const el = document.getElementById(categories[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveTab(categories[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [categories, searchQuery, dietaryFilter]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 140, behavior: 'smooth' });
      setActiveTab(id);
    }
  };

  // Filtered menu logic
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (dietaryFilter === 'special' && !item.isChefSpecial) return false;
      if (dietaryFilter === 'veg' && !item.dietary.includes('veg') && !item.dietary.includes('vegan')) return false;
      if (dietaryFilter === 'vegan' && !item.dietary.includes('vegan')) return false;
      if (dietaryFilter === 'gf' && !item.dietary.includes('gf')) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const name = getItemName(item).toLowerCase();
        const desc = getItemDesc(item).toLowerCase();
        const origin = (item.origin || '').toLowerCase();
        const pairing = (getItemPairing(item) || '').toLowerCase();
        return (
          name.includes(query) ||
          desc.includes(query) ||
          origin.includes(query) ||
          pairing.includes(query)
        );
      }

      return true;
    });
  }, [menuItems, dietaryFilter, searchQuery, lang]);

  const getCategoryCount = (catId: string) => {
    return filteredItems.filter((i) => i.category === catId).length;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDietaryFilter('all');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title={`${t('menu.title')} | RHY Bistro`} 
        description={t('menu.subtitle')} 
      />

      {/* ── HERO HEADER ── */}
      <section className="relative w-full overflow-hidden bg-[#0c1a12] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-center items-center pt-28 pb-14 sm:pt-32 sm:pb-16 px-4 sm:px-6 text-center">
        <img 
          src={fondueImg} 
          alt="RHY Bistro Menu Culinary Experience" 
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
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight drop-shadow-2xl mb-4 leading-[1.1]"
          >
            {t('menu.title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/85 font-serif italic max-w-2xl mx-auto mb-6 sm:mb-8 font-light leading-relaxed drop-shadow-md"
          >
            {t('menu.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-medium text-white/90 mb-4"
          >
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <CheckCircle2 size={13} className="text-accent" />
              {lang === 'de' ? 'AOP & Regionale Herkunft' : lang === 'it' ? 'Prodotti AOP e Regionali' : lang === 'fr' ? 'Produits AOP & Locaux' : 'AOP & Regional Sourcing'}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <CheckCircle2 size={13} className="text-accent" />
              {lang === 'de' ? 'Walliser Spezialitäten' : lang === 'it' ? 'Specialità del Vallese' : lang === 'fr' ? 'Spécialités Valaisannes' : 'Swiss Valais Heritage'}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <CheckCircle2 size={13} className="text-accent" />
              {lang === 'de' ? 'Kuratierte Weinauswahl' : lang === 'it' ? 'Selezione Pregiata della Cantina' : lang === 'fr' ? 'Sélection Cave & Terroirs' : 'Curated Cellar Selection'}
            </span>
          </motion.div>

          <div className="flex items-center gap-4 mt-2">
            <div className="w-12 h-px bg-accent/70" />
            <UtensilsCrossed size={16} className="text-accent" />
            <div className="w-12 h-px bg-accent/70" />
          </div>
        </div>
      </section>

      {/* ── STICKY NAVIGATION & CONTROLS ── */}
      <div className="sticky top-[60px] sm:top-[68px] z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          {/* Main Category Tabs */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar pb-1">
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = getCategoryCount(cat.id);
                const isActive = activeTab === cat.id && !searchQuery.trim();
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollTo(cat.id)}
                    data-testid={`tab-${cat.id}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-xs md:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-accent/30'
                        : 'bg-background hover:bg-muted text-foreground border border-border/80 hover:border-primary/50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-accent' : 'text-muted-foreground'} />
                    <span>{cat.label}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick table reservation link */}
            <Link href="/reservation" className="hidden lg:inline-flex flex-shrink-0">
              <Button size="sm" className="bg-accent text-white hover:bg-accent/90 rounded-full text-xs font-semibold px-4 gap-1.5 shadow-sm">
                <Calendar size={13} />
                {t('menu.bookThisExperience')}
              </Button>
            </Link>
          </div>

          {/* Interactive Search & Dietary Filter Row */}
          <div className="mt-3 pt-3 border-t border-border/60 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('menu.searchPlaceholder')}
                className="w-full pl-9 pr-9 py-2 rounded-full text-xs md:text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-muted-foreground/70"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dietary Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-shrink-0 text-xs">
              <span className="text-muted-foreground font-medium hidden sm:inline mr-1 flex-shrink-0 flex items-center gap-1">
                <SlidersHorizontal size={12} />
                {lang === 'de' ? 'Filter:' : lang === 'it' ? 'Filtri:' : lang === 'fr' ? 'Filtres :' : 'Filters:'}
              </span>

              <button
                onClick={() => setDietaryFilter('all')}
                className={`px-3 py-1.5 rounded-full transition-colors font-medium flex-shrink-0 ${
                  dietaryFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-muted/70 hover:bg-muted text-muted-foreground'
                }`}
              >
                {t('menu.filters.all')}
              </button>

              <button
                onClick={() => setDietaryFilter('special')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors font-medium flex-shrink-0 ${
                  dietaryFilter === 'special'
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-accent/10 hover:bg-accent/20 text-accent-foreground border border-accent/20'
                }`}
              >
                <Sparkles size={11} className="text-accent" />
                {t('menu.filters.special')}
              </button>

              <button
                onClick={() => setDietaryFilter('veg')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors font-medium flex-shrink-0 ${
                  dietaryFilter === 'veg'
                    ? 'bg-green-700 text-white'
                    : 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200'
                }`}
              >
                <Leaf size={11} />
                {t('menu.filters.veg')}
              </button>

              <button
                onClick={() => setDietaryFilter('vegan')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors font-medium flex-shrink-0 ${
                  dietaryFilter === 'vegan'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                }`}
              >
                {t('menu.filters.vegan')}
              </button>

              <button
                onClick={() => setDietaryFilter('gf')}
                className={`px-3 py-1.5 rounded-full transition-colors font-medium flex-shrink-0 ${
                  dietaryFilter === 'gf'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200'
                }`}
              >
                {t('menu.filters.gf')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTER BAR (IF FILTERED) ── */}
      {(searchQuery.trim() || dietaryFilter !== 'all') && (
        <div className="bg-muted/40 border-b border-border py-2.5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredItems.length} {lang === 'de' ? 'Gericht(e) gefunden' : lang === 'it' ? 'piatto/i trovato/i' : lang === 'fr' ? 'plat(s) trouvé(s)' : 'dish(es) found'}
              {searchQuery && <> {lang === 'de' ? 'für' : lang === 'it' ? 'per' : lang === 'fr' ? 'pour' : 'for'} &ldquo;<strong>{searchQuery}</strong>&rdquo;</>}
            </span>
            <button
              onClick={clearFilters}
              className="text-accent font-semibold hover:underline flex items-center gap-1"
            >
              <X size={12} /> {t('menu.viewAll')}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN MENU CONTENT ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-28">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border p-8 my-8 max-w-md mx-auto">
            <UtensilsCrossed size={40} className="mx-auto text-muted-foreground/60 mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">{t('menu.noResults')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === 'de' 
                ? 'Versuchen Sie, Ihren Suchbegriff oder die Filter anzupassen.' 
                : lang === 'it'
                ? 'Prova a modificare i termini di ricerca o i filtri alimentari.'
                : lang === 'fr' 
                ? 'Essayez de modifier votre mot-clé ou vos filtres alimentaires.' 
                : 'Try adjusting your search terms or dietary filters.'}
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-full">
              {t('menu.viewAll')}
            </Button>
          </div>
        ) : (
          <div className="space-y-24">
            {categories.map((cat) => {
              const items = filteredItems.filter((i) => i.category === cat.id);
              if (!items.length) return null;

              const isWine = cat.id === 'wine';
              const isMains = cat.id === 'mains';
              const catDescription = t(`menu.categoryDescriptions.${cat.id}`);

              return (
                <section
                  key={cat.id}
                  id={cat.id}
                  className="scroll-mt-48 transition-all"
                >
                  {/* Category Header */}
                  <div className="text-center mb-12 max-w-2xl mx-auto">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent mb-3">
                      <cat.icon size={22} />
                    </div>
                    <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight">
                      {cat.label}
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base mt-2 font-light leading-relaxed">
                      {catDescription}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <div className="w-12 h-px bg-accent/40" />
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <div className="w-12 h-px bg-accent/40" />
                    </div>
                  </div>

                  {/* SPECIAL HERITAGE CALLOUT FOR MAINS */}
                  {isMains && (
                    <div className="mb-12 relative overflow-hidden rounded-xl border border-accent/40 bg-gradient-to-br from-card via-card to-accent/5 p-6 sm:p-8 shadow-sm">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-full md:w-48 h-40 rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-accent/20">
                          <img 
                            src={fondueImg} 
                            alt="Swiss Fondue & Raclette Tradition" 
                            width="192"
                            height="160"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold mb-2">
                            <Sparkles size={12} />
                            {lang === 'de' ? 'Schweizer Alpentradition' : lang === 'it' ? 'Tradizione Alpina Svizzera' : lang === 'fr' ? 'Tradition des Alpages' : 'Swiss Alpine Heritage'}
                          </div>
                          <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                            {t('menu.traditionCalloutTitle')}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-4">
                            {t('menu.traditionCalloutDesc')}
                          </p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-primary">
                            <span className="flex items-center gap-1">
                              🧀 Gruyère AOP & Vacherin Fribourgeois AOP
                            </span>
                            <span className="hidden sm:inline text-muted-foreground">•</span>
                            <span className="flex items-center gap-1">
                              🍷 {lang === 'de' ? 'Empfohlener Wein: Walliser Fendant' : lang === 'it' ? 'Vino consigliato: Fendant del Vallese' : lang === 'fr' ? 'Accord vin recommandé : Fendant du Valais' : 'Recommended wine: Valais Fendant'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Link href="/reservation">
                            <Button className="bg-primary text-white hover:bg-primary/90 rounded-full text-xs font-semibold px-5 py-2">
                              {t('menu.bookThisExperience')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DISHES LIST / GRID */}
                  {isWine ? (
                    /* SOMMELIER WINE CARD LAYOUT */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {items.map((wineItem) => {
                        const wineLabel = getWineTypeLabel(wineItem.wineType);
                        return (
                          <div
                            key={wineItem.id}
                            className="group bg-card border border-border/80 hover:border-accent/60 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                          >
                            <div>
                              {/* Wine Top Badges & Origin */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  {wineLabel && (
                                    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      wineItem.wineType === 'white' 
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                        : wineItem.wineType === 'red'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                        : 'bg-purple-100 text-purple-900 border border-purple-200'
                                    }`}>
                                      {wineLabel}
                                    </span>
                                  )}

                                  {wineItem.isChefSpecial && (
                                    <span className="text-[10px] font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Sparkles size={10} /> {t('menu.specialBadge')}
                                    </span>
                                  )}
                                </div>

                                {wineItem.origin && (
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    📍 {wineItem.origin}
                                  </span>
                                )}
                              </div>

                              {/* Wine Name */}
                              <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                                {getItemName(wineItem)}
                              </h3>

                              {/* Sommelier Tasting Note */}
                              <p className="text-muted-foreground text-sm font-light leading-relaxed mb-4">
                                {getItemDesc(wineItem)}
                              </p>
                            </div>

                            {/* Wine Pairing & Pricing Bar */}
                            <div className="pt-3 border-t border-border/60">
                              {getItemPairing(wineItem) && (
                                <div className="text-xs text-primary/90 font-medium mb-3 flex items-start gap-1.5 bg-primary/5 p-2 rounded-md">
                                  <Wine size={13} className="text-accent flex-shrink-0 mt-0.5" />
                                  <span>{getItemPairing(wineItem)}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {/* Glass Price */}
                                  <div>
                                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">
                                      {t('menu.glass')} (1dl)
                                    </span>
                                    <span className="font-serif font-bold text-base text-primary">
                                      {wineItem.price} <span className="text-xs font-sans font-normal text-muted-foreground">CHF</span>
                                    </span>
                                  </div>

                                  {/* Bottle Price */}
                                  {wineItem.bottlePrice && (
                                    <div>
                                      <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">
                                        {t('menu.bottle')} (75cl)
                                      </span>
                                      <span className="font-serif font-bold text-base text-primary">
                                        {wineItem.bottlePrice} <span className="text-xs font-sans font-normal text-muted-foreground">CHF</span>
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <Link href="/reservation">
                                  <Button variant="ghost" size="sm" className="text-xs text-accent hover:text-accent/90 hover:bg-accent/10 rounded-full h-8 px-3 gap-1">
                                    <span>{lang === 'de' ? 'Probieren' : lang === 'it' ? 'Degusta' : lang === 'fr' ? 'Déguster' : 'Order'}</span>
                                    <ChevronRight size={13} />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* STANDARD DISH GRID */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {items.map((item) => {
                        const thumb = (item as any).image || (item as any).imageUrl || ITEM_IMAGES[item.id];
                        const dishName = getItemName(item);
                        const dishDesc = getItemDesc(item);
                        const dishPairing = getItemPairing(item);

                        return (
                          <div
                            key={item.id}
                            className="group bg-card border border-border/70 hover:border-accent/50 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md flex gap-4 sm:gap-5"
                          >
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                {/* Header: Title, Tags & Price */}
                                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <h3 className="font-serif font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors">
                                      {dishName}
                                    </h3>
                                    
                                    {/* Dietary Badges */}
                                    {item.dietary?.includes('veg') && (
                                      <span 
                                        title={t('menu.filters.veg')} 
                                        className="text-[10px] font-bold text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-300 px-1.5 py-0.5 rounded-sm"
                                      >
                                        V
                                      </span>
                                    )}
                                    {item.dietary?.includes('vegan') && (
                                      <span 
                                        title={t('menu.filters.vegan')} 
                                        className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm"
                                      >
                                        VG
                                      </span>
                                    )}
                                    {item.dietary?.includes('gf') && (
                                      <span 
                                        title={t('menu.filters.gf')} 
                                        className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 px-1.5 py-0.5 rounded-sm"
                                      >
                                        GF
                                      </span>
                                    )}
                                    {item.isChefSpecial && (
                                      <span className="text-[10px] font-bold text-accent bg-accent/15 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                                        ★
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex-shrink-0 font-serif font-bold text-lg text-primary ml-2">
                                    {item.price} <span className="text-xs font-sans font-normal text-muted-foreground">CHF</span>
                                  </div>
                                </div>

                                {/* Description */}
                                <p className="text-muted-foreground text-sm leading-relaxed font-light mt-1">
                                  {dishDesc}
                                </p>
                              </div>

                              {/* Footer: Origin or Pairing */}
                              <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                {item.origin ? (
                                  <span className="font-light italic text-[11px]">
                                    📍 {item.origin}
                                  </span>
                                ) : (
                                  <span />
                                )}

                                {dishPairing && (
                                  <span className="text-accent font-medium text-[11px] flex items-center gap-1">
                                    <Wine size={11} /> {dishPairing}
                                  </span>
                                )}

                                {item.volume && (
                                  <span className="font-light text-[11px] text-muted-foreground">
                                    {item.volume}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dish Thumbnail */}
                            {thumb && (
                              <div className="flex-shrink-0 self-start">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border shadow-sm group-hover:border-accent/50 transition-colors">
                                  <img 
                                    src={thumb} 
                                    alt={dishName} 
                                    width="80"
                                    height="80"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/assets/image_1785084864495-opt.jpg';
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* ── ALLERGEN & MARKET NOTICE ── */}
        <div className="mt-20 bg-card border border-border/80 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-serif font-bold text-base text-foreground mb-1">
              {lang === 'de' 
                ? 'Information zu Allergenen & Regionalität' 
                : lang === 'it' 
                ? 'Informazioni sugli Allergeni e Provenienza' 
                : lang === 'fr' 
                ? 'Information sur les allergènes & Terroir' 
                : 'Allergens & Regional Provenance'}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('menu.allergensNote')}
            </p>
          </div>
        </div>

        {/* ── BOTTOM RESERVATION CTA STRIP ── */}
        <div className="mt-12 bg-primary text-primary-foreground rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent pointer-events-none" />
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">
            {lang === 'de'
              ? 'Ein Tisch erwartet Sie im RHY Bistro'
              : lang === 'it'
              ? 'Un tavolo ti aspetta al RHY Bistro'
              : lang === 'fr'
              ? 'Une table vous attend chez RHY'
              : 'Your Table Awaits at RHY Bistro'}
          </h3>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base font-light mb-8">
            {lang === 'de'
              ? 'Reservieren Sie jetzt online und geniessen Sie traditionelle Schweizer Küche und edle Walliser Weine.'
              : lang === 'it'
              ? 'Prenota ora il tuo tavolo online per gustare la cucina alpina svizzera e gli straordinari vini del Vallese.'
              : lang === 'fr'
              ? 'Réservez dès maintenant pour déguster nos spécialités suisses, viandes d’alpages et grands crus du Valais.'
              : 'Book your table online now to indulge in traditional Swiss alpine cooking and exceptional Valais wines.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/reservation">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 rounded-full text-sm font-semibold px-8 h-12 shadow-lg">
                <Calendar size={16} className="mr-2" />
                {t('home.bookTable')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white hover:text-primary text-white border-white/20 rounded-full text-sm font-semibold px-8 h-12">
                {t('nav.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
