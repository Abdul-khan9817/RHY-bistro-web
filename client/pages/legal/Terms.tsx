import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/SEO';

export default function Terms() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en';

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <SEO title={t('footer.legal.terms')} />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl prose prose-neutral prose-headings:font-serif prose-headings:text-primary prose-a:text-accent max-w-none">
        <h1 className="text-4xl font-serif font-bold text-primary mb-10 text-center">{t('footer.legal.terms')}</h1>
        
        {lang === 'fr' ? (
          <>
            <h2>1. Réservations</h2>
            <p>Les réservations peuvent être effectuées en ligne, par téléphone ou sur place. Une réservation n'est définitive qu'après confirmation de notre part (par e-mail ou SMS).</p>
            
            <h2>2. Annulation et No-show</h2>
            <p>En cas d'empêchement, nous vous prions de bien vouloir annuler votre réservation au moins 24 heures à l'avance. Pour les groupes de plus de 6 personnes, le délai est de 48 heures. En cas de non-présentation (no-show) ou d'annulation tardive répétée, la direction se réserve le droit de refuser de futures réservations.</p>

            <h2>3. Retards</h2>
            <p>La table est maintenue pendant 20 minutes après l'heure de réservation. Au-delà, la table pourra être réattribuée sans préavis.</p>

            <h2>4. Groupes</h2>
            <p>Pour les groupes de plus de 8 personnes, un menu unique pourra être exigé et des conditions d'acompte spécifiques s'appliquent. Merci de nous contacter directement.</p>

            <h2>5. Allergies et régimes spéciaux</h2>
            <p>Merci de nous signaler toute allergie ou intolérance alimentaire lors de la réservation. Bien que nous prenions toutes les précautions nécessaires, nous ne pouvons garantir l'absence totale de traces d'allergènes dans nos cuisines.</p>

            <h2>6. Droit applicable</h2>
            <p>Les présentes conditions sont soumises au droit suisse. Le for juridique est à Sion, Valais.</p>
          </>
        ) : (
          <>
            <h2>1. Reservations</h2>
            <p>Reservations can be made online, by phone, or in person. A reservation is only confirmed once you receive confirmation from us (via email or SMS).</p>
            
            <h2>2. Cancellation and No-show</h2>
            <p>If you are unable to attend, please cancel your reservation at least 24 hours in advance. For groups of more than 6 people, the notice period is 48 hours. In the event of a no-show or repeated late cancellations, management reserves the right to refuse future bookings.</p>

            <h2>3. Delays</h2>
            <p>Tables are held for 20 minutes past the reservation time. After this period, the table may be released without notice.</p>

            <h2>4. Groups</h2>
            <p>For groups of more than 8 people, a set menu may be required and specific deposit conditions apply. Please contact us directly.</p>

            <h2>5. Allergies and Dietary Requirements</h2>
            <p>Please inform us of any allergies or dietary intolerances when booking. While we take every precaution, we cannot guarantee the complete absence of allergen traces in our kitchens.</p>

            <h2>6. Applicable Law</h2>
            <p>These terms and conditions are governed by Swiss law. The place of jurisdiction is Sion, Valais.</p>
          </>
        )}
      </div>
    </div>
  );
}
