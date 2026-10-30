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
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '4.5rem 0 2.5rem' }}>
      <motion.div
        className="container-premium"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          
          <motion.div variants={itemVariants}>
            <a href="/" className="logo-premium" style={{ marginBottom: '1rem' }}>
              <span
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--color-text)",
                  display: "inline-block",
                }}
              />
              <span>IMAFORBES</span>
            </a>
            <p className="text-muted" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '300px', margin: '0.5rem 0 0.85rem' }}>
              {t("footer.description") || "Building digital experiences with passion and precision."}
            </p>
            <span className="section-label" style={{ marginBottom: 0 }}>
              CDMX · FULL STACK & UI
            </span>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="section-label" style={{ marginBottom: '1.25rem' }}>
              {t("footer.navigation") || "Navigation"}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.4rem 1rem' }}>
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
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      color: location.pathname === item.path ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontWeight: location.pathname === item.path ? 500 : 400,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'color 0.2s ease',
                      padding: '0.4rem 0',
                      minHeight: '38px'
                    }}
                  >
                    <span>{t(item.label)}</span>
                    {location.pathname === item.path && (
                      <motion.div layoutId="footerActive" style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-text)' }} />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="section-label" style={{ marginBottom: '1.25rem' }}>
              {t("footer.get-in-touch") || "Get in Touch"}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <a
                href="mailto:imanol@imaforbes.com"
                className="ecosystem-cta"
                style={{ justifyContent: 'space-between', width: 'fit-content', padding: '0.5rem 1.15rem 0.5rem 0.65rem', minHeight: '46px' }}
              >
                <span className="ecosystem-icon" style={{ width: '32px', height: '32px' }}>
                  <Mail size={14} />
                </span>
                <span style={{ textTransform: 'none', letterSpacing: '0.01em', fontSize: '0.9rem', fontWeight: 500 }}>imanol@imaforbes.com</span>
                <ArrowUpRight size={14} />
              </a>
              
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {t("footer.response-time") || "Usually responds within 24 hours"}
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        <motion.div variants={itemVariants} style={{ paddingTop: '1.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
            © {currentYear} Imanol Pérez Arteaga. {t("footer.copyright")}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span>{t("footer.made-with")}</span>
          </div>
        </motion.div>

      </motion.div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default withProviders(Footer);
