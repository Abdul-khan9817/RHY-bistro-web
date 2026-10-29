import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr';
import en from './locales/en';
import de from './locales/de';
import it from './locales/it';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      de: { translation: de },
      it: { translation: it },
    },
    lng: localStorage.getItem('rhy-bistro-lang') || 'fr',
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'de', 'it'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
