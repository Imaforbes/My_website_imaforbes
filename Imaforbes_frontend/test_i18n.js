import i18next from 'i18next';
import en from './src/Locales/en/translation.json' assert { type: 'json' };

i18next.init({
  lng: 'en',
  resources: {
    en: { translation: en }
  }
}, (err, t) => {
  console.log("header.about-me:", t("header.about-me"));
  console.log("header.home:", t("header.home"));
  console.log("home.title:", t("home.title"));
});
