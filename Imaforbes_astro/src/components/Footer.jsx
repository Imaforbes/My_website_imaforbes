import withProviders from './withProviders.jsx';
// src/components/Footer.jsx
import React, { memo } from 'react';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight } from 'lucide-react';
import { openCvModal } from '../utils/cvModal.js';

const Footer = memo(({ currentPath }) => {
  const { t } = useTranslation();
  const location = { pathname: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/") };
  const currentYear = new Date().getFullYear();

  const navItems = [
    { path: "/", label: "header.home" },
    { path: "/about", label: "header.about-me" },
    { path: "/trajectory", label: "header.trajectory" },
    { path: "/projects", label: "header.projects" },
    { path: "/blog", label: "header.blog" },
    { path: "/contact", label: "header.contact" },
    { path: "#cv", label: "header.cv", isCvModal: true },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <footer style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', padding: '4rem 0 2rem' }} className="dark:bg-[#0a0a0a] dark:border-strong">
      <motion.div
        className="container-premium"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          
          <motion.div variants={itemVariants}>
            <a href="/" style={{ display: 'inline-block', marginBottom: '1.5rem', textDecoration: 'none' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.1em', color: 'var(--color-text)' }} className="dark:text-text">
                IMAFORBES
              </h3>
            </a>
            <p className="text-muted" style={{ maxWidth: '300px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {t("footer.description") || "Building digital experiences with passion and precision."}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text)', marginBottom: '1.5rem' }} className="dark:text-text">
              {t("footer.navigation") || "Navigation"}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {navItems.map((item) => (
                <li key={item.path}>
                  <a 
                    href={item.path}
                    onClick={(e) => {
                      if (item.isCvModal) {
                        e.preventDefault();
                        openCvModal();
                      }
                    }}
                    style={{ 
                      textDecoration: 'none', 
                      fontSize: '0.95rem',
                      color: location.pathname === item.path ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontWeight: location.pathname === item.path ? 500 : 300,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'color 0.2s ease',
                      padding: '0.5rem 0',
                      minHeight: '44px' /* Fitts's Law: 44x44px minimum touch target */
                    }}
                    className={`dark:text-text-muted dark:hover:text-text ${location.pathname === item.path ? 'dark:!text-text' : ''}`}
                  >
                    <span>{t(item.label)}</span>
                    {location.pathname === item.path && (
                      <motion.div layoutId="footerActive" style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-text)' }} className="dark:bg-surface" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text)', marginBottom: '1.5rem' }} className="dark:text-text">
              {t("footer.get-in-touch") || "Get in Touch"}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="mailto:imanol@imaforbes.com" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem', padding: '0.5rem', margin: '-0.5rem', borderRadius: '8px', minHeight: '44px' }} className="dark:hover:text-text hover:bg-surface dark:hover:bg-[#111] transition-colors">
                <div style={{ padding: '0.5rem', background: 'var(--color-surface)', borderRadius: '6px' }} className="dark:bg-background">
                  <Mail size={16} />
                </div>
                <span>imanol@imaforbes.com</span>
                <ArrowUpRight size={14} style={{ opacity: 0.5 }} />
              </a>
              
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {t("footer.response-time") || "Usually responds within 24 hours"}
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        <motion.div variants={itemVariants} style={{ paddingTop: '2rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }} className="dark:border-strong">
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            © {currentYear} Imanol Pérez Arteaga. {t("footer.copyright")}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span>{t("footer.made-with")}</span>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default withProviders(Footer);
