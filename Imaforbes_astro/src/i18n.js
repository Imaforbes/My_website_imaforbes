import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './Locales/en/translation.json';
import translationES from './Locales/es/translation.json';
import { safeLocalStorage } from './utils/storage.js';

// Get saved language from localStorage or use browser detection
const savedLanguage = safeLocalStorage.getItem('app_language');

i18n
    // Detecta el idioma del navegador del usuario
    .use(LanguageDetector)
    // Pasa la instancia de i18n a react-i18next.
    .use(initReactI18next)
    // Configuración inicial
    .init({
        debug: false,
        lng: 'es', // Force Spanish on SSR and initial client render to match SSR HTML
        fallbackLng: 'es',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: translationEN
            },
            es: {
                translation: translationES
            }
        }
    });

export default i18n;