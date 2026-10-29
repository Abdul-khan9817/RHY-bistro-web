import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/SEO';

export default function Privacy() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr' | 'en';

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <SEO title={t('footer.legal.privacy')} />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl prose prose-neutral prose-headings:font-serif prose-headings:text-primary prose-a:text-accent max-w-none">
        <h1 className="text-4xl font-serif font-bold text-primary mb-10 text-center">{t('footer.legal.privacy')}</h1>
        
        {lang === 'fr' ? (
          <>
            <h2>1. Responsable du traitement</h2>
            <p>RHY Bistro, Rue du Bistro 12, 1950 Sion, Suisse est responsable du traitement de vos données personnelles sur ce site web.</p>
            
            <h2>2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li>Données d'identification (nom, prénom)</li>
              <li>Données de contact (e-mail, téléphone)</li>
              <li>Données de réservation (date, heure, nombre de personnes, demandes spéciales)</li>
            </ul>

            <h2>3. Finalité du traitement</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul>
              <li>Gérer vos réservations au restaurant</li>
              <li>Répondre à vos demandes de contact</li>
              <li>L'envoi de notre newsletter (seulement avec votre consentement explicite)</li>
            </ul>

            <h2>4. Conservation et sécurité</h2>
            <p>Vos données sont stockées sur des serveurs sécurisés en Suisse. Elles sont conservées pour la durée nécessaire aux finalités décrites, ou selon les obligations légales suisses de conservation.</p>

            <h2>5. Vos droits</h2>
            <p>Conformément à la Loi fédérale sur la protection des données (LPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant vos données. Contactez-nous à info@rhybistro.ch pour exercer ces droits.</p>
          </>
        ) : (
          <>
            <h2>1. Data Controller</h2>
            <p>RHY Bistro, Rue du Bistro 12, 1950 Sion, Switzerland is responsible for processing your personal data on this website.</p>
            
            <h2>2. Collected Data</h2>
            <p>We collect the following data:</p>
            <ul>
              <li>Identification data (first name, last name)</li>
              <li>Contact data (email, phone number)</li>
              <li>Reservation data (date, time, number of guests, special requests)</li>
            </ul>

            <h2>3. Purpose of Processing</h2>
            <p>Your data is used exclusively to:</p>
            <ul>
              <li>Manage your restaurant reservations</li>
              <li>Respond to your contact inquiries</li>
              <li>Send our newsletter (only with your explicit consent)</li>
            </ul>

            <h2>4. Storage and Security</h2>
            <p>Your data is stored on secure servers in Switzerland. It is retained for the duration necessary for the described purposes, or according to Swiss legal retention obligations.</p>

            <h2>5. Your Rights</h2>
            <p>In accordance with the Federal Act on Data Protection (FADP), you have the right to access, rectify, delete, and object to the processing of your data. Contact us at info@rhybistro.ch to exercise these rights.</p>
          </>
        )}
      </div>
    </div>
  );
}
