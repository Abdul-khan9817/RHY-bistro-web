import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquarePlus, CheckCircle2, User, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { testimonials as defaultTestimonials } from '../data/testimonials';
import { getActiveLang } from '../lib/lang';

export interface UserReview {
  id: number | string;
  name: string;
  location: string;
  rating: number;
  textFr?: string;
  textEn?: string;
  textDe?: string;
  textIt?: string;
  text?: string;
  date: string;
  isUserAdded?: boolean;
}

const STORAGE_KEY = 'rhy-bistro-user-reviews';

export function CustomerReviews() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);
  const { toast } = useToast();

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ name?: string; comment?: string }>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsedStored: UserReview[] = stored ? JSON.parse(stored) : [];
      setReviews([...parsedStored, ...defaultTestimonials]);
    } catch {
      setReviews(defaultTestimonials);
    }
  }, []);

  const getReviewText = (item: UserReview) => {
    if (item.text) return item.text;
    if (lang === 'de') return item.textDe || item.textEn || item.textFr;
    if (lang === 'it') return item.textIt || item.textFr || item.textEn;
    if (lang === 'en') return item.textEn || item.textFr;
    return item.textFr || item.textEn;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; comment?: string } = {};

    if (!name.trim()) {
      newErrors.name = lang === 'de' ? 'Bitte geben Sie Ihren Namen ein' : lang === 'it' ? 'Inserisci il tuo nome' : lang === 'fr' ? 'Veuillez entrer votre nom' : 'Please enter your name';
    }
    if (!comment.trim() || comment.trim().length < 10) {
      newErrors.comment = lang === 'de' ? 'Mindestens 10 Zeichen erforderlich' : lang === 'it' ? 'Almeno 10 caratteri richiesti' : lang === 'fr' ? 'Au moins 10 caractères requis' : 'Minimum 10 characters required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newReview: UserReview = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || (lang === 'de' ? 'Schweiz' : lang === 'it' ? 'Svizzera' : lang === 'fr' ? 'Suisse' : 'Switzerland'),
      rating,
      text: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      isUserAdded: true,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsedStored: UserReview[] = stored ? JSON.parse(stored) : [];
      const updated = [newReview, ...parsedStored];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setReviews([newReview, ...reviews]);
    } catch {
      setReviews([newReview, ...reviews]);
    }

    toast({
      title: t('home.reviewSuccess'),
      duration: 5000,
    });

    // Reset form
    setName('');
    setLocation('');
    setRating(5);
    setComment('');
    setErrors({});
    setIsFormOpen(false);
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <section className="py-24 bg-background relative overflow-hidden border-t border-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
              <Star size={13} className="fill-accent text-accent" />
              {lang === 'de' ? 'Verifizierte Gästemeinungen' : lang === 'it' ? 'Recensioni Verificate' : lang === 'fr' ? 'Avis Vérifiés' : 'Verified Feedback'}
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight">
              {t('home.testimonialsTitle')}
            </h2>
            <p className="text-muted-foreground mt-3 text-base font-light leading-relaxed">
              {t('home.testimonialsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex flex-col items-end mr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-3xl font-bold text-primary">{avgRating}</span>
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-light">
                {reviews.length} {lang === 'de' ? 'Bewertungen' : lang === 'it' ? 'recensioni' : lang === 'fr' ? 'avis déposés' : 'reviews submitted'}
              </span>
            </div>

            <Button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="bg-accent text-white hover:bg-accent/90 rounded-sm px-5 py-2.5 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
              data-testid="button-open-review-form"
            >
              {isFormOpen ? <X size={16} /> : <MessageSquarePlus size={16} />}
              {t('home.writeReview')}
            </Button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border/70 hover:border-accent/40 rounded-sm p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-accent">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={15}
                        className={idx < item.rating ? "fill-accent text-accent" : "text-border"}
                      />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 size={12} />
                    {t('home.verifiedGuest')}
                  </span>
                </div>

                <p className="text-foreground/85 italic leading-relaxed text-base mb-6 font-light">
                  &ldquo;{getReviewText(item)}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-serif font-bold text-base flex items-center justify-center border border-primary/20">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-primary text-sm leading-snug">{item.name}</h3>
                    <p className="text-xs text-muted-foreground font-light">{item.location}</p>
                  </div>
                </div>

                <span className="text-[11px] text-muted-foreground/80 font-mono">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Review Form Modal / Inline Drawer */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="bg-primary text-white p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold">{t('home.leaveReviewTitle')}</h3>
                  <p className="text-xs text-white/70 mt-1">
                    {lang === 'de'
                      ? 'Ihre Bewertung hilft anderen Gästen und unserem Küchenteam.'
                      : lang === 'it'
                      ? 'La tua recensione aiuta altri ospiti e la nostra brigata di cucina.'
                      : lang === 'fr' 
                      ? 'Votre avis aide les futurs convives et notre brigade de cuisine.' 
                      : 'Your feedback helps future guests and our kitchen brigade.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-white/70 hover:text-white p-1 rounded-sm"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    {t('home.ratingLabel')}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        aria-label={`Rate ${val} stars`}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(val)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={
                            val <= (hoverRating ?? rating)
                              ? "fill-accent text-accent"
                              : "text-border stroke-1"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-3 font-serif font-bold text-lg text-accent">
                      {hoverRating ?? rating} / 5
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="review-name-input" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {t('home.nameLabel')} *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="review-name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'de' ? 'Z.B. Hans Muster' : lang === 'it' ? 'Es. Marco Rossi' : lang === 'fr' ? 'Ex. Jean Dupont' : 'E.g. John Doe'}
                      className="pl-9 rounded-sm border-border"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="review-location-input" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {t('home.locationLabel')}
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="review-location-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={lang === 'de' ? 'Z.B. Basel, Zürich, Etzgen' : lang === 'it' ? 'Es. Lugano, Bellinzona' : lang === 'fr' ? 'Ex. Basel, Etzgen' : 'E.g. Zurich, Geneva'}
                      className="pl-9 rounded-sm border-border"
                    />
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="review-comment-input" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    {t('home.commentLabel')} *
                  </label>
                  <Textarea
                    id="review-comment-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder={lang === 'de'
                      ? 'Beschreiben Sie Ihre Erfahrung, Ihre Lieblingsgerichte und den Service...'
                      : lang === 'it'
                      ? 'Descrivi la tua esperienza, i tuoi piatti preferiti e il servizio...'
                      : lang === 'fr' 
                      ? 'Décrivez votre expérience, vos plats préférés et le service...' 
                      : 'Describe your dining experience, favorite dishes, and service...'}
                    className="rounded-sm border-border resize-none"
                  />
                  {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-sm text-sm"
                  >
                    {lang === 'de' ? 'Abbrechen' : lang === 'it' ? 'Annulla' : lang === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-accent text-white hover:bg-accent/90 rounded-sm text-sm font-semibold px-6"
                  >
                    {t('home.submitReview')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
