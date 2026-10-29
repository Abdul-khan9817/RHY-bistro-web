import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { SEO } from '../components/SEO';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarIcon, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menu as staticMenu, type MenuItemType } from '../data/menu';
import fondueImg from '@assets/image_1785084917216-opt.jpg';
import { getActiveLang } from '../lib/lang';

type MenuCategory = MenuItemType['category'];

type SelectableMenuItem = {
  id: string;
  nameEn: string;
  nameFr: string;
  nameDe?: string;
  nameIt?: string;
  descEn: string;
  descFr: string;
  descDe?: string;
  descIt?: string;
  price: number;
  category: MenuCategory;
};

type CartQty = Record<string, number>;

export default function Reservation() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<SelectableMenuItem[]>(
    staticMenu.map((item) => ({
      id: item.id,
      nameEn: item.nameEn,
      nameFr: item.nameFr,
      nameDe: item.nameDe,
      nameIt: item.nameIt,
      descEn: item.descEn,
      descFr: item.descFr,
      descDe: item.descDe,
      descIt: item.descIt,
      price: item.price,
      category: item.category,
    })),
  );
  const [menuCategory, setMenuCategory] = useState<MenuCategory | 'all'>('starters');
  const [cart, setCart] = useState<CartQty>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/menu');
        const json = await res.json();
        if (!res.ok || !json.success || !Array.isArray(json.data) || json.data.length === 0) return;
        if (cancelled) return;
        setMenuItems(
          json.data.map((item: any) => ({
            id: String(item._id || item.id),
            nameEn: item.nameEn,
            nameFr: item.nameFr,
            descEn: item.descEn,
            descFr: item.descFr,
            price: Number(item.price),
            category: item.category as MenuCategory,
          })),
        );
      } catch {
        // Keep static menu fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(8, "Phone required"),
    date: z.date({ required_error: "Date is required" }),
    time: z.string().min(1, "Time is required"),
    guests: z.string().refine(val => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1 && num <= 8;
    }, "Must be between 1 and 8"),
    requests: z.string().optional(),
  });

  type ResValues = z.infer<typeof resSchema>;

  const form = useForm<ResValues>({
    resolver: zodResolver(resSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      time: '',
      guests: '2',
      requests: '',
    }
  });

  const categories = useMemo(
    () =>
      [
        { id: 'starters' as const, label: t('menu.categories.starters') },
        { id: 'mains' as const, label: t('menu.categories.mains') },
        { id: 'desserts' as const, label: t('menu.categories.desserts') },
        { id: 'drinks' as const, label: t('menu.categories.drinks') },
        { id: 'wine' as const, label: t('menu.categories.wine') },
      ],
    [t],
  );

  const visibleItems = useMemo(
    () =>
      menuCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => item.category === menuCategory),
    [menuItems, menuCategory],
  );

  const selectedItems = useMemo(
    () =>
      menuItems
        .filter((item) => (cart[item.id] || 0) > 0)
        .map((item) => ({
          menuItemId: item.id,
          nameEn: item.nameEn,
          nameFr: item.nameFr,
          nameDe: item.nameDe,
          nameIt: item.nameIt,
          price: item.price,
          quantity: cart[item.id],
          category: item.category,
        })),
    [menuItems, cart],
  );

  const preOrderTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const setQty = (id: string, next: number) => {
    setCart((prev) => {
      const qty = Math.max(0, Math.min(20, next));
      if (qty <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: qty };
    });
  };

  const onSubmit = async (data: ResValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const dateStr = format(data.date, "yyyy-MM-dd");
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          guests: parseInt(data.guests, 10),
          date: dateStr,
          time: data.time,
          requests: data.requests || "",
          preOrderedItems: selectedItems,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error || (lang === 'fr' ? "Erreur lors de la réservation." : "Booking could not be completed."));
        return;
      }

      setSuccessRef(json.ref || json.data?.ref);
      setCart({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setServerError(lang === 'fr' ? "Erreur de connexion. Veuillez réessayer." : "Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const lunchTimes = ["12:00", "12:30", "13:00", "13:30"];
  const dinnerTimes = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];

  if (successRef) {
    return (
      <div className="min-h-screen pt-28 pb-24 bg-background flex items-center justify-center">
        <SEO title={t('reservation.title')} />
        <div className="max-w-md w-full bg-white p-10 rounded-xl border border-border text-center shadow-lg mx-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary mb-4">{t('reservation.success')}</h2>
          <div className="bg-muted p-4 rounded-lg mb-8 font-mono text-xl tracking-widest font-bold text-primary border border-border">
            {successRef}
          </div>
          <p className="text-muted-foreground mb-8">
            {lang === 'fr' 
              ? 'Un e-mail de confirmation vous a été envoyé. Au plaisir de vous recevoir !'
              : 'A confirmation email has been sent. We look forward to welcoming you!'}
          </p>
          <Button onClick={() => setSuccessRef(null)} variant="outline" className="w-full">
            {lang === 'fr' ? 'Nouvelle réservation' : 'New booking'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('reservation.title')} />
      
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-[#0c1a12] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-center items-center pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 text-center">
        <img 
          src={fondueImg} 
          alt="Reservation RHY Bistro" 
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 sm:mb-5 shadow-sm">
            <CalendarIcon size={14} className="text-accent" />
            <span className="text-white/90 font-semibold tracking-widest uppercase text-[11px] sm:text-xs">
              RHY Bistro · Réservations en Ligne
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight drop-shadow-2xl mb-4 leading-[1.1]">
            {t('reservation.title')}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/85 font-serif italic max-w-2xl mx-auto mb-6 font-light leading-relaxed drop-shadow-md">
            {lang === 'de'
              ? 'Buchen Sie Ihren Tisch und wählen Sie Ihre Wunschgerichte vorab aus.'
              : lang === 'it'
              ? 'Prenota il tuo tavolo e seleziona in anticipo le tue portate preferite.'
              : lang === 'fr'
              ? 'Réservez votre table et pré-commandez vos mets pour une dégustation sur mesure.'
              : 'Book your table and pre-order your favorite dishes for an exceptional dining experience.'}
          </p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-accent/70" />
            <span className="text-accent text-xl">❧</span>
            <div className="w-12 h-px bg-accent/70" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 max-w-3xl py-16">

        <div className="bg-white p-8 md:p-12 rounded-xl border border-border shadow-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold border-b border-border pb-2">{lang === 'fr' ? 'Vos coordonnées' : 'Your details'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('reservation.name')} *</label>
                  <Input {...form.register('name')} className={form.formState.errors.name ? "border-destructive" : ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('reservation.email')} *</label>
                  <Input type="email" {...form.register('email')} className={form.formState.errors.email ? "border-destructive" : ""} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">{t('reservation.phone')} *</label>
                  <Input type="tel" {...form.register('phone')} className={form.formState.errors.phone ? "border-destructive" : ""} />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-6 pt-4">
              <h3 className="font-serif text-xl font-bold border-b border-border pb-2">{lang === 'fr' ? 'La table' : 'The table'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Guests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('reservation.guests')} *</label>
                  <Controller
                    name="guests"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className={form.formState.errors.guests ? "border-destructive" : ""}>
                          <SelectValue placeholder="2" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n} {lang === 'fr' ? 'personnes' : 'guests'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('reservation.date')} *</label>
                  <Controller
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.date && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Choisir...</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{t('reservation.time')} *</label>
                  <Controller
                    name="time"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className={form.formState.errors.time ? "border-destructive" : ""}>
                          <SelectValue placeholder="Heure..." />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">{t('hours.lunch')}</div>
                          {lunchTimes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase mt-2">{t('hours.dinner')}</div>
                          {dinnerTimes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('reservation.requests')}</label>
                <Textarea {...form.register('requests')} rows={3} placeholder={lang === 'fr' ? 'Allergies, anniversaire...' : 'Allergies, birthday...'} />
              </div>
            </div>

            {/* Pre-order menu */}
            <div className="space-y-5 pt-4">
              <div className="border-b border-border pb-2">
                <h3 className="font-serif text-xl font-bold">{t('reservation.preOrderTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('reservation.preOrderHint')}</p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMenuCategory(cat.id)}
                    className={cn(
                      "px-4 py-1.5 text-sm whitespace-nowrap border transition-colors",
                      menuCategory === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary hover:text-primary",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-border border border-border">
                {visibleItems.map((item) => {
                  const qty = cart[item.id] || 0;
                  const name = lang === 'de' ? (item.nameDe || item.nameEn || item.nameFr) : lang === 'it' ? (item.nameIt || item.nameFr || item.nameEn) : lang === 'fr' ? item.nameFr : item.nameEn;
                  const desc = lang === 'de' ? (item.descDe || item.descEn || item.descFr) : lang === 'it' ? (item.descIt || item.descFr || item.descEn) : lang === 'fr' ? item.descFr : item.descEn;
                  return (
                    <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{name}</div>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>
                        <div className="mt-2 text-sm font-semibold text-primary">
                          CHF {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(item.id, qty - 1)}
                          disabled={qty === 0}
                          className="h-8 w-8 inline-flex items-center justify-center border border-border disabled:opacity-40 hover:border-primary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-mono text-sm">{qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(item.id, qty + 1)}
                          className="h-8 w-8 inline-flex items-center justify-center border border-border hover:border-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedItems.length > 0 && (
                <div className="bg-muted/60 border border-border p-4 space-y-2">
                  <div className="text-sm font-medium">{t('reservation.preOrderSelected')}</div>
                  {selectedItems.map((item) => {
                    const itemName = lang === 'de' ? (item.nameDe || item.nameEn || item.nameFr) : lang === 'it' ? (item.nameIt || item.nameFr || item.nameEn) : lang === 'fr' ? item.nameFr : item.nameEn;
                    return (
                      <div key={item.menuItemId} className="flex justify-between text-sm gap-4">
                        <span className="text-muted-foreground">
                          {item.quantity}× {itemName}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          CHF {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between pt-2 border-t border-border font-serif font-bold text-primary">
                    <span>{t('reservation.preOrderTotal')}</span>
                    <span>CHF {preOrderTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {serverError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                {serverError}
              </div>
            )}

            <div className="pt-6">
              <Button type="submit" disabled={submitting} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-serif">
                {submitting ? (lang === 'fr' ? 'Confirmation en cours...' : 'Submitting booking...') : t('reservation.submit')}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4 italic">
                {t('reservation.groupNote')}
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
