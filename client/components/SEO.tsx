import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
}

export function SEO({ title, description, image }: SEOProps) {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    document.title = `${title} | RHY Bistro`;
    document.documentElement.lang = i18n.language;
    
    // Manage meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || "L'art de vivre alpin, l'élégance gastronomique. RHY Bistro, restaurant à Sion.");

    // Manage Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${title} | RHY Bistro`);

  }, [title, description, i18n.language]);

  return null;
}
