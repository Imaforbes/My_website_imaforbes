// src/components/CvModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CvModal = () => {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef(null);
  const [step, setStep] = useState('lang'); // 'lang' | 'format'
  const [selectedLang, setSelectedLang] = useState('en');

  const closeDialog = () => {
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  };

  useEffect(() => {
    const handleOpen = (e) => {
      const defaultLang = e?.detail?.lang || (i18n.language && i18n.language.startsWith('es') ? 'es' : 'en');
      setSelectedLang(defaultLang);
      setStep('lang');
      if (dialogRef.current && !dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    };

    window.addEventListener('open-cv-modal', handleOpen);
    return () => window.removeEventListener('open-cv-modal', handleOpen);
  }, [i18n.language]);

  // Fallback for browsers without native <dialog closedby="any"> support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || typeof HTMLDialogElement === 'undefined') return;
    if ('closedBy' in HTMLDialogElement.prototype) return;

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isDialogContent) {
        dialog.close();
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, []);

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
    closeDialog();
  };

  const handleOpenMarkdown = () => {
    window.open(`/cv?lang=${selectedLang}`, '_blank');
    closeDialog();
  };

  const langName = selectedLang === 'es' ? t('cvModal.spanish', 'Español') : t('cvModal.english', 'English');

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' })}
      aria-labelledby="cv-modal-title"
      onClose={() => {
        if (dialogRef.current) {
          dialogRef.current.returnValue = '';
        }
      }}
      className="w-full max-w-md max-h-[95vh] m-auto overflow-y-auto overflow-x-hidden rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl text-text"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-strong/40 dark:border-strong">
        <h2 id="cv-modal-title" className="text-base sm:text-lg font-medium tracking-wide m-0">
          {t('cvModal.title', 'Curriculum Vitae')}
        </h2>
        <form method="dialog">
          <button
            type="submit"
            className="btn-premium btn-premium-surface p-2 rounded-full cursor-pointer"
            style={{ minWidth: '36px', minHeight: '36px', padding: '0.4rem' }}
            aria-label={t('cvModal.close', 'Close modal')}
          >
            <X size={18} />
          </button>
        </form>
      </div>

      {/* Step 1: Language Selection */}
      {step === 'lang' && (
        <motion.div
          key="lang-step"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="py-2 text-center"
        >
          <p className="text-sm sm:text-base text-text dark:text-text-muted mb-6 font-normal">
            {t('cvModal.lang-question', 'In which language do you want it?')}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs mx-auto">
            <button
              type="button"
              autoFocus
              onClick={() => handleSelectLang('en')}
              className="btn-premium btn-premium-surface flex items-center justify-center py-3 px-5 rounded-2xl font-medium text-sm sm:text-base min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
            >
              {t('cvModal.english', 'English')}
            </button>
            <button
              type="button"
              onClick={() => handleSelectLang('es')}
              className="btn-premium btn-premium-surface flex items-center justify-center py-3 px-5 rounded-2xl font-medium text-sm sm:text-base min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
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
          transition={{ duration: 0.2 }}
          className="py-2 text-center"
        >
          <p className="text-xs sm:text-sm text-text dark:text-text-muted mb-3">
            {t('cvModal.selected-lang', 'Selected language:')}{' '}
            <span className="font-medium text-text dark:text-text">{langName}</span>{' '}
            <button
              type="button"
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
              type="button"
              onClick={handleOpenMarkdown}
              className="btn-premium btn-premium-surface flex items-center justify-center py-3 px-5 rounded-2xl font-medium text-sm sm:text-base min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
            >
              {t('cvModal.markdown', 'Markdown')}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="btn-premium btn-premium-surface flex items-center justify-center py-3 px-5 rounded-2xl font-medium text-sm sm:text-base min-h-[46px] sm:min-h-[48px] cursor-pointer w-full"
            >
              {t('cvModal.pdf', 'PDF')}
            </button>
          </div>
        </motion.div>
      )}
    </dialog>
  );
};

export default CvModal;
