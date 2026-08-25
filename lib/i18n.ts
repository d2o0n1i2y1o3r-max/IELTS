import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../public/locales/en/translation.json';
import uzTranslation from '../public/locales/uz/translation.json';
import ruTranslation from '../public/locales/ru/translation.json';

const resources = {
  en: { translation: enTranslation },
  uz: { translation: uzTranslation },
  ru: { translation: ruTranslation }
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: ['en', 'uz', 'ru'],
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });
}

export default i18n;
