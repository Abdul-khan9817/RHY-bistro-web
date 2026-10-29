export type SupportedLang = 'fr' | 'en' | 'de' | 'it';

export function getActiveLang(i18nInstance: { resolvedLanguage?: string; language?: string }): SupportedLang {
  const code = (i18nInstance.resolvedLanguage || i18nInstance.language || 'fr').toLowerCase();
  if (code.startsWith('de')) return 'de';
  if (code.startsWith('it')) return 'it';
  if (code.startsWith('en')) return 'en';
  return 'fr';
}

/**
 * Returns the localized text from a record or multi-lingual object.
 * Falls back to German/English/French if the current language isn't populated.
 */
export function getLocalizedText<T extends Record<string, any>>(
  item: T,
  fieldPrefix: string,
  lang: SupportedLang,
  fallback = ''
): string {
  const capitalPrefix = fieldPrefix.charAt(0).toUpperCase() + fieldPrefix.slice(1);
  const langKey = `${fieldPrefix}${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
  
  if (item[langKey]) return item[langKey];
  
  // Intelligent fallbacks
  if (lang === 'de' && item[`${fieldPrefix}En`]) return item[`${fieldPrefix}En`];
  if (lang === 'it' && item[`${fieldPrefix}Fr`]) return item[`${fieldPrefix}Fr`];
  if (item[`${fieldPrefix}Fr`]) return item[`${fieldPrefix}Fr`];
  if (item[`${fieldPrefix}En`]) return item[`${fieldPrefix}En`];
  
  return fallback;
}
