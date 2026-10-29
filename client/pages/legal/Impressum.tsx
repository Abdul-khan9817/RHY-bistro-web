import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../../components/SEO';

export default function Impressum() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <SEO title={t('footer.legal.impressum')} />
      
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
        <h1 className="text-4xl font-serif font-bold text-primary mb-10">{t('footer.legal.impressum')}</h1>
        
        <div className="bg-white p-10 rounded-xl border border-border shadow-sm max-w-lg mx-auto text-left space-y-6">
          
          <div>
            <h3 className="font-serif font-bold text-lg text-primary mb-1">Raison sociale / Company</h3>
            <p className="text-muted-foreground">RHY Bistro Sàrl</p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-primary mb-1">Adresse / Address</h3>
            <p className="text-muted-foreground">
              Rue du Bistro 12<br />
              1950 Sion<br />
              Valais, Suisse
            </p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-primary mb-1">Contact</h3>
            <p className="text-muted-foreground">
              Téléphone : +41 27 123 45 67<br />
              E-mail : info@rhybistro.ch
            </p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-primary mb-1">Direction / Management</h3>
            <p className="text-muted-foreground">Marc Dubois</p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-primary mb-1">Numéro IDE / UID-Nummer</h3>
            <p className="text-muted-foreground">CHE-123.456.789</p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-primary mb-1">Hébergement / Hosting</h3>
            <p className="text-muted-foreground">Replit, Inc.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
