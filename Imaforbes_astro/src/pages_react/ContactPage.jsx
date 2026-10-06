import withProviders from '../components/withProviders.jsx';
// src/pages/ContactPage.jsx
/**
 * ContactPage - Minimalist & Deluxe Design
 * 
 * DESIGN CHANGES:
 * - Removed animated blob backgrounds
 * - Changed from colorful gradient backgrounds to clean white/dark
 * - Updated form inputs: clean borders with black/white focus states
 * - Updated contact info cards: minimalist white/dark cards with subtle borders
 * - Changed buttons: black/white minimalist style
 * - Added text reflection effect to title
 * - Updated social links: border style instead of colorful backgrounds
 * - Simplified animations and removed colorful accents
 */
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";
import {
  FiSend,
  FiMail,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiLoader,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
import { useContact } from "../hooks/useApi";
import { useTranslation } from "react-i18next";

const HeroBackground = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }} ></div>
    
    {/* Subtle animated gradient glow */}
    <motion.div 
      initial={{ opacity: 0.1, scale: 0.9 }}
      animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ 
        position: 'absolute', 
        bottom: '10%', 
        left: '20%', 
        width: '50vw', 
        height: '50vw', 
        background: 'radial-gradient(circle, rgba(150,150,150,0.03) 0%, rgba(0,0,0,0) 60%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}
    />
    
    {/* Grid pattern very faint */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'linear-gradient(rgba(100,100,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
      maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
    }} />
  </div>
);

const ContactPage = () => {
  const { t } = useTranslation();
  const { formData, status, validationErrors, handleChange, sendMessage, clearStatus } =
    useContact();

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => clearStatus(), 5000);
      return () => clearTimeout(timer);
    }
  }, [status.message, clearStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(formData);
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
  };


  return (
    <>
      <section id="contacto" className="projects-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <HeroBackground />
        <div className="container-premium" style={{ position: 'relative', zIndex: 10 }}>
          
          <div className="projects-header" style={{ position: 'relative', paddingTop: '1rem' }}>
            {/* Available Badge - Perfectly centered above title, zero crowding or overlapping */}
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
            >
              <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.6rem', 
                  padding: '0.5rem 1.25rem', borderRadius: '9999px', 
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                  position: 'relative'
                }} className="dark:bg-[#111] dark:border-strong">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                  {t("contact.available-badge", "Available for new opportunities")}
                </div>
              </BorderBeam>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="projects-title"
            >
              {t("contact.title")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-muted"
              style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}
            >
              {t("contact.description")}
            </motion.p>
          </div>

          <div className="about-grid" style={{ alignItems: 'flex-start' }}>
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              <h3 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--color-text)' }} className="dark:text-text">
                {t("contact.contact-info")}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <a href="mailto:imanol@imaforbes.com" className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '8px', flexShrink: 0 }} className="dark:bg-background">
                    <FiMail size={20} style={{ color: 'var(--color-text)' }} className="dark:text-text-muted" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Email</p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', wordBreak: 'break-word' }} className="dark:text-text">imanol@imaforbes.com</p>
                  </div>
                </a>

                <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '8px', flexShrink: 0 }} className="dark:bg-background">
                    <FiMapPin size={20} style={{ color: 'var(--color-text)' }} className="dark:text-text-muted" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t("contact.location-label", "Location")}</p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', wordBreak: 'break-word' }} className="dark:text-text">{t("contact.location-value", "Mexico City, MX")}</p>
                  </div>
                </div>

                <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '8px', flexShrink: 0 }} className="dark:bg-background">
                    <FiClock size={20} style={{ color: 'var(--color-text)' }} className="dark:text-text-muted" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t("contact.available-label", "Available")}</p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', wordBreak: 'break-word' }} className="dark:text-text">{t("contact.available-hours", "Mon - Fri, 9AM - 5PM")}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Connect with me
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <a
                    href="https://www.linkedin.com/in/imanol-pérez-arteaga-a72a08235"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium"
                    style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <FiLinkedin size={18} />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="https://github.com/Imaforbes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium"
                    style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <FiGithub size={18} />
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://twitter.com/imaforbes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium"
                    style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <FiTwitter size={18} />
                    <span>Twitter</span>
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.form
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="card-premium"
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: 'clamp(1.5rem, 5vw, 2.5rem)' }}
            >
              <div>
                <label htmlFor="name" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text)' }} className="dark:text-text">
                  {t("contact.name")}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  className={`bg-gray-50 border ${validationErrors.name ? 'border-red-500' : 'border-strong'} focus:border-strong focus:ring-2 focus:ring-gray-900/20 text-text dark:bg-[#151515] dark:${validationErrors.name ? 'border-red-500' : 'border-strong'} dark:focus:border-white dark:focus:ring-white/20 dark:text-text outline-none`}
                  placeholder="Tu nombre completo"
                />
                {validationErrors.name && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{validationErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text)' }} className="dark:text-text">
                  {t("contact.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  className={`bg-gray-50 border ${validationErrors.email ? 'border-red-500' : 'border-strong'} focus:border-strong focus:ring-2 focus:ring-gray-900/20 text-text dark:bg-[#151515] dark:${validationErrors.email ? 'border-red-500' : 'border-strong'} dark:focus:border-white dark:focus:ring-white/20 dark:text-text outline-none`}
                  placeholder="tu@correo.com"
                />
                {validationErrors.email && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{validationErrors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text)' }} className="dark:text-text">
                  {t("contact.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  maxLength={2000}
                  style={{ 
                    width: '100%', 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    resize: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  className={`bg-gray-50 border ${validationErrors.message ? 'border-red-500' : 'border-strong'} focus:border-strong focus:ring-2 focus:ring-gray-900/20 text-text dark:bg-[#151515] dark:${validationErrors.message ? 'border-red-500' : 'border-strong'} dark:focus:border-white dark:focus:ring-white/20 dark:text-text outline-none`}
                  placeholder="¿En qué te puedo ayudar?"
                ></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  {validationErrors.message ? (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{validationErrors.message}</p>
                  ) : <div></div>}
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {formData.message.length}/2000
                  </p>
                </div>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-strong dark:bg-[#151515] dark:border-strong">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="privacy"
                    name="privacy"
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-strong text-text focus:ring-gray-900 dark:border-strong dark:bg-background dark:checked:bg-surface dark:focus:ring-white transition-colors cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="privacy" className="text-sm font-medium text-text dark:text-text cursor-pointer">
                    {t("contact.privacy-title")}
                  </label>
                  <p className="text-xs text-text dark:text-text-muted mt-1">
                    {t("contact.privacy-text")}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={status.sending}
                className="group relative flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-background text-text dark:bg-surface dark:text-text"
              >
                <div className="absolute inset-0 bg-surface/20 dark:bg-background/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <div className="relative z-10 flex items-center gap-2 font-medium">
                  {status.sending ? (
                    <>
                      <FiLoader className="animate-spin" />
                      <span>{t("contact.sending")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("contact.send")}</span>
                      <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      <div style={{ position: 'fixed', top: '6rem', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '500px', zIndex: 60, pointerEvents: 'none' }}>
        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                background: status.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                pointerEvents: 'auto',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {status.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertTriangle size={20} />}
                <p style={{ fontWeight: 500 }}>{status.message}</p>
              </div>
              <button
                onClick={clearStatus}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}
              >
                <FiX size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default withProviders(ContactPage);
