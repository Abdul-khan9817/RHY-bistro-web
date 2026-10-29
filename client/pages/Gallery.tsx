import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import img1 from '@assets/image_1785084864495-opt.jpg';
import img2 from '@assets/image_1785084917216-opt.jpg';
import img3 from '@assets/image_1785084872921-opt.jpg';
import img4 from '@assets/image_1785084845728-opt.jpg';
import img5 from '@assets/image_1785084930701-opt.jpg';
import img6 from '@assets/image_1785084947299-opt.jpg';

type Category = 'all' | 'food' | 'ambiance' | 'events';

const photos = [
  { id: 0, src: img1, category: 'food' as Category,    alt: 'Raclette traditionnelle' },
  { id: 1, src: img3, category: 'ambiance' as Category, alt: 'Planche de charcuterie' },
  { id: 2, src: img2, category: 'food' as Category,    alt: 'Fondue au fromage' },
  { id: 3, src: img4, category: 'food' as Category,    alt: 'Flammkuchen maison' },
  { id: 4, src: img5, category: 'ambiance' as Category, alt: 'Ambiance du bistro' },
  { id: 5, src: img6, category: 'events' as Category,  alt: 'Événement spécial' },
  { id: 6, src: img3, category: 'food' as Category,    alt: 'Apéritif' },
  { id: 7, src: img1, category: 'food' as Category,    alt: 'Service raclette' },
  { id: 8, src: img4, category: 'ambiance' as Category, alt: 'Notre carte' },
  { id: 9, src: img2, category: 'food' as Category,    alt: 'Fondue partagée' },
  { id: 10, src: img6, category: 'events' as Category, alt: 'Soirée spéciale' },
  { id: 11, src: img5, category: 'ambiance' as Category,alt: 'Détails en salle' },
];

export default function Gallery() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Category>('all');
  const [lightboxId, setLightboxId] = useState<string | number | null>(null);
  const [apiPhotos, setApiPhotos] = useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    fetch('/api/gallery')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setApiPhotos(
            json.data.map((item: any) => ({
              id: item._id,
              src: item.imageUrl,
              category: item.category as Category,
              alt: item.alt || item.title || 'Photo RHY Bistro',
              title: item.title,
            })),
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const allPhotos = apiPhotos.length > 0 ? apiPhotos : photos;
  const filtered = filter === 'all' ? allPhotos : allPhotos.filter((p) => p.category === filter);
  const lbIdx = lightboxId !== null ? filtered.findIndex((p) => p.id === lightboxId) : -1;

  const navigate = (dir: 1 | -1) => {
    if (lbIdx === -1) return;
    const next = (lbIdx + dir + filtered.length) % filtered.length;
    setLightboxId(filtered[next].id);
  };

  const filters: { id: Category; label: string }[] = [
    { id: 'all',     label: t('gallery.filters.all') },
    { id: 'food',    label: t('gallery.filters.food') },
    { id: 'ambiance',label: t('gallery.filters.ambiance') },
    { id: 'events',  label: t('gallery.filters.events') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('gallery.title')} />

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-[#0c1a12] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-center items-center pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 text-center">
        <img 
          src={img1} 
          alt="Galerie RHY Bistro" 
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
            <Camera size={14} className="text-accent" />
            <span className="text-white/90 font-semibold tracking-widest uppercase text-[11px] sm:text-xs">
              RHY Bistro · Photothèque
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight drop-shadow-2xl mb-4 leading-[1.1]"
          >
            {t('gallery.title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/85 font-serif italic max-w-2xl mx-auto mb-6 font-light leading-relaxed drop-shadow-md"
          >
            {t('gallery.subtitle')}
          </motion.p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-accent/70" />
            <Camera size={16} className="text-accent" />
            <div className="w-12 h-px bg-accent/70" />
          </div>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border py-4 sticky top-[60px] sm:top-[68px] z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex overflow-x-auto hide-scrollbar gap-2 sm:gap-3 justify-start sm:justify-center">
          {filters.map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)} 
              data-testid={`filter-${f.id}`}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                filter === f.id
                  ? 'bg-primary text-white shadow-md ring-2 ring-accent/30'
                  : 'bg-background border border-border text-foreground hover:border-primary hover:text-primary'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((photo, i) => (
                <motion.div key={photo.id} layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className={`relative w-full overflow-hidden rounded-sm cursor-pointer group break-inside-avoid shadow-sm
                    ${i % 5 === 0 ? 'aspect-[3/4]' : i % 3 === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}
                  onClick={() => setLightboxId(photo.id)}
                  data-testid={`gallery-img-${photo.id}`}>
                  <img src={photo.src} alt={photo.alt}
                    width="400"
                    height="400"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 flex flex-col justify-end p-5">
                    <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <Camera size={14} className="text-accent" />
                        <p className="text-white font-serif text-base font-medium">{photo.alt}</p>
                      </div>
                      <div className="w-8 h-0.5 bg-accent" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4"
            onClick={() => setLightboxId(null)}>
            <button className="absolute top-5 right-5 text-white/50 hover:text-white p-2 z-50 transition-colors"
              onClick={e => { e.stopPropagation(); setLightboxId(null); }} aria-label="Close lightbox" data-testid="lightbox-close">
              <X size={30} />
            </button>
            <button className="absolute left-4 md:left-8 text-white/50 hover:text-white p-2 z-50 bg-black/20 hover:bg-black/50 rounded-full transition-colors"
              onClick={e => { e.stopPropagation(); navigate(-1); }} aria-label="Previous image">
              <ChevronLeft size={44} />
            </button>
            <button className="absolute right-4 md:right-8 text-white/50 hover:text-white p-2 z-50 bg-black/20 hover:bg-black/50 rounded-full transition-colors"
              onClick={e => { e.stopPropagation(); navigate(1); }} aria-label="Next image">
              <ChevronRight size={44} />
            </button>
            {(() => {
              const photo = allPhotos.find(p => p.id === lightboxId);
              return photo ? (
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                  className="flex flex-col items-center max-w-5xl w-full"
                  onClick={e => e.stopPropagation()}>
                  <img src={photo.src} alt={photo.alt}
                    className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-sm" />
                  <div className="mt-4 text-center">
                    <p className="text-white font-serif text-lg tracking-wide">{photo.alt}</p>
                    <p className="text-white/40 text-xs uppercase tracking-widest mt-1">
                      {lbIdx + 1} / {filtered.length}
                    </p>
                  </div>
                </motion.div>
              ) : null;
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
