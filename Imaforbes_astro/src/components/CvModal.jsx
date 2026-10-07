// src/components/CvModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CvModal = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('lang'); // 'lang' | 'format'
  const [selectedLang, setSelectedLang] = useState('en');

  useEffect(() => {
    const handleOpen = (e) => {
      const defaultLang = e?.detail?.lang || (i18n.language && i18n.language.startsWith('es') ? 'es' : 'en');
      setSelectedLang(defaultLang);
      setStep('lang');
      setIsOpen(true);
    };

    window.addEventListener('open-cv-modal', handleOpen);
    return () => window.removeEventListener('open-cv-modal', handleOpen);
  }, [i18n.language]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectLang = (lang) => {
    setSelectedLang(lang);
    setStep('format');
  };

  const handleDownloadPdf = () => {
    const pdfUrl =
      selectedLang === 'es'
        ? '/resources/CvEsp_Imanol Perez Arteaga.pdf'
        : '/resources/CvIng_Imanol Perez Arteaga.pdf';
    const filename =
      selectedLang === 'es'
        ? 'Imanol_Perez_Arteaga_CV_ES.pdf'
        : 'Imanol_Perez_Arteaga_CV_EN.pdf';

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsOpen(false);
  };

  const handleOpenMarkdown = () => {
    window.open(`/cv?lang=${selectedLang}`, '_blank');
    setIsOpen(false);
  };

  const langName = selectedLang === 'es' ? t('cvModal.spanish', 'Español') : t('cvModal.english', 'English');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl text-text"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-strong/40 dark:border-strong">
              <h3 className="text-base sm:text-lg font-medium tracking-wide">
                {t('cvModal.title', 'Curriculum Vitae')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-2xl border border-strong dark:border-strong hover:bg-surface/60 dark:hover:bg-background text-text dark:text-text-muted transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step 1: Language Selection */}
            {step === 'lang' && (
              <motion.div
                key="lang-step"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="py-2 text-center"
              >
                <p className="text-sm sm:text-base text-text dark:text-text-muted mb-6 font-normal">
                  {t('cvModal.lang-question', 'In which language do you want it?')}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs mx-auto">
                  <button
                    onClick={() => handleSelectLang('en')}
                    className="btn-premium flex items-center justify-center py-3 px-5 rounded-2xl bg-surface hover:bg-background text-text font-medium text-sm sm:text-base border border-border transition-all duration-150 min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
                  >
                    {t('cvModal.english', 'English')}
                  </button>
                  <button
                    onClick={() => handleSelectLang('es')}
                    className="btn-premium flex items-center justify-center py-3 px-5 rounded-2xl bg-surface hover:bg-background text-text font-medium text-sm sm:text-base border border-border transition-all duration-150 min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
                  >
                    {t('cvModal.spanish', 'Spanish')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Format Selection */}
            {step === 'format' && (
              <motion.div
                key="format-step"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="py-2 text-center"
              >
                <p className="text-xs sm:text-sm text-text dark:text-text-muted mb-3">
                  {t('cvModal.selected-lang', 'Selected language:')}{' '}
                  <span className="font-medium text-text dark:text-text">{langName}</span>{' '}
                  <button
                    onClick={() => setStep('lang')}
                    className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-1 cursor-pointer"
                  >
                    {t('cvModal.change', '(Change)')}
                  </button>
                </p>

                <p className="text-sm sm:text-base text-text dark:text-text-muted mb-6 font-normal">
                  {t(
                    'cvModal.format-question',
                    'Download my curriculum vitae in your preferred format:'
                  )}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs mx-auto">
                  <button
                    onClick={handleOpenMarkdown}
                    className="btn-premium flex items-center justify-center py-3 px-5 rounded-2xl bg-surface hover:bg-background text-text font-medium text-sm sm:text-base border border-border transition-all duration-150 min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
                  >
                    {t('cvModal.markdown', 'Markdown')}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="btn-premium flex items-center justify-center py-3 px-5 rounded-2xl bg-surface hover:bg-background text-text font-medium text-sm sm:text-base border border-border transition-all duration-150 min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
                  >
                    {t('cvModal.pdf', 'PDF')}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CvModal;
