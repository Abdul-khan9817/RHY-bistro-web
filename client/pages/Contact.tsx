import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, Send, Utensils, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { getActiveLang } from '../lib/lang';
import heroImg from '@assets/image_1785084947299-opt.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } }),
};

export default function Contact() {
  const { t, i18n } = useTranslation();
  const lang = getActiveLang(i18n);
  const { toast } = useToast();

  const contactSchema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Invalid email'),
    subject: z.string().min(2, 'Subject required'),
    message: z.string().min(10, 'Min 10 chars'),
  });

  type ContactFormValues = z.infer<typeof contactSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log('Contact submission:', data);
    toast({ title: t('contact.success'), duration: 5000 });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('nav.contact')} />

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden bg-[#0c1a12] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col justify-center items-center pt-28 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 text-center">
        <img 
          src={heroImg} 
          alt="Contact RHY Bistro" 
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
            <MapPin size={14} className="text-accent" />
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
            {t('contact.title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/85 font-serif italic max-w-2xl mx-auto mb-6 sm:mb-8 font-light leading-relaxed drop-shadow-md"
          >
            {lang === 'de'
              ? 'Für Reservierungen, private Anlässe oder allgemeine Fragen – wir freuen uns auf Sie.'
              : lang === 'it'
              ? 'Per prenotazioni, eventi privati o semplici informazioni – siamo a vostra disposizione.'
              : lang === 'fr'
              ? 'Pour vos réservations, événements privés ou simples questions – nous sommes à votre écoute.'
              : 'For reservations, private gatherings, or any inquiries — we look forward to welcoming you.'}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-medium text-white/90 mb-4"
          >
            <a 
              href="tel:+41794251666" 
              className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm transition-colors text-white"
            >
              <Phone size={13} className="text-accent" /> +41 79 425 16 66
            </a>
            <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <Clock size={13} className="text-accent" /> Wed – Sun : 11:00 – 20:00
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <MapPin size={13} className="text-accent" /> Landstrasse 53, Etzgen
            </span>
          </motion.div>

          <div className="flex items-center gap-4 mt-2">
            <div className="w-12 h-px bg-accent/70" />
            <span className="text-accent text-sm tracking-widest uppercase">✦ Suisse ✦</span>
            <div className="w-12 h-px bg-accent/70" />
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── FORM ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show"
            className="bg-white rounded-sm p-8 sm:p-10 border border-border shadow-sm">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-primary mb-2">
              {lang === 'de' ? 'Senden Sie uns eine Nachricht' : lang === 'it' ? 'Inviaci un messaggio' : lang === 'fr' ? 'Envoyez-nous un message' : 'Send us a message'}
            </h2>
            <div className="w-10 h-0.5 bg-accent mb-8" />

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {t('contact.name')} *
                </label>
                <Input
                  {...form.register('name')}
                  placeholder="Jean Dupont"
                  className="rounded-sm border-border focus:border-accent"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {t('contact.email')} *
                </label>
                <Input
                  type="email"
                  {...form.register('email')}
                  placeholder="jean.dupont@example.ch"
                  className="rounded-sm border-border focus:border-accent"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {t('contact.subject')} *
                </label>
                <Input
                  {...form.register('subject')}
                  placeholder={lang === 'de' ? 'Reservierungsanfrage, Event...' : lang === 'it' ? 'Richiesta di prenotazione, evento...' : lang === 'fr' ? 'Demande de réservation, événement...' : 'Booking inquiry, event...'}
                  className="rounded-sm border-border focus:border-accent"
                />
                {form.formState.errors.subject && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {t('contact.message')} *
                </label>
                <Textarea
                  {...form.register('message')}
                  rows={5}
                  placeholder={lang === 'de' ? 'Ihre Nachricht...' : lang === 'it' ? 'Il tuo messaggio...' : lang === 'fr' ? 'Votre message...' : 'Your message...'}
                  className="rounded-sm border-border focus:border-accent resize-none"
                />
                {form.formState.errors.message && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-accent text-white hover:bg-accent/90 py-3 text-sm font-semibold tracking-wide rounded-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send size={15} />
                {t('contact.submit')}
              </Button>
            </form>
          </motion.div>

          {/* ── INFO CARDS ── */}
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show" className="space-y-6">

            {/* Coordinates */}
            <div className="bg-white rounded-sm p-8 border border-border shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-xl text-primary mb-4">Coordonnées</h3>

              {[
                {
                  icon: <MapPin size={18} className="text-accent flex-shrink-0" />,
                  title: t('contact.address'),
                  content: (
                    <>
                      Landstrasse 53<br />
                      5275 Etzgen, Suisse
                    </>
                  ),
                },
                {
                  icon: <Phone size={18} className="text-accent flex-shrink-0" />,
                  title: t('contact.phone'),
                  content: (
                    <a href="tel:+41794251666" className="hover:text-accent transition-colors font-medium">
                      +41 79 425 16 66
                    </a>
                  ),
                },
                {
                  icon: <Clock size={18} className="text-accent flex-shrink-0" />,
                  title: lang === 'de' ? 'Öffnungszeiten' : lang === 'it' ? 'Orari' : lang === 'fr' ? 'Horaires' : 'Hours',
                  content: (
                    <>
                      {lang === 'de' ? 'Mi – So: 11:00 – 20:00' : lang === 'it' ? 'Mer – Dom: 11:00 – 20:00' : lang === 'fr' ? 'Mer - Dim : 11:00 - 20:00' : 'Wed - Sun: 11:00 - 20:00'}<br />
                      <span className="italic">{lang === 'de' ? 'Mo – Di: Geschlossen' : lang === 'it' ? 'Lun – Mar: Chiuso' : lang === 'fr' ? 'Lun - Mar : Fermé' : 'Mon - Tue: Closed'}</span>
                    </>
                  ),
                },
                {
                  icon: <Utensils size={18} className="text-accent flex-shrink-0" />,
                  title: lang === 'de' ? 'Serviceangebot' : lang === 'it' ? 'Servizi' : lang === 'fr' ? 'Services' : 'Services',
                  content: (
                    <span className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-sm">
                        <Utensils size={12} /> {lang === 'de' ? 'Vor Ort' : lang === 'it' ? 'Sul posto' : lang === 'fr' ? 'Sur place' : 'Dine-in'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-sm">
                        <ShoppingBag size={12} /> {lang === 'de' ? 'Takeaway' : lang === 'it' ? 'Da asporto' : lang === 'fr' ? 'À emporter' : 'Takeaway'}
                      </span>
                    </span>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start pb-5 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{item.title}</p>
                    <div className="text-sm text-foreground/80 font-light leading-relaxed">{item.content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Maps Embed / Card */}
            <div className="bg-white rounded-sm border border-border shadow-sm overflow-hidden">
              <div className="aspect-[16/9] w-full bg-muted relative">
                <iframe
                  title="RHY Bistro Etzgen Google Maps"
                  src="https://maps.google.com/maps?q=Landstrasse%2053%2C%205275%20Etzgen%20Switzerland&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
              <div className="p-4 text-center bg-muted/30">
                <a
                  href="https://maps.google.com/?q=Landstrasse+53,+5275+Etzgen,+Switzerland"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent font-semibold hover:underline"
                >
                  {t('contact.openMap')} →
                </a>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
