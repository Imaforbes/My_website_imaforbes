import withProviders from './withProviders.jsx';
// src/components/Header.jsx
import React, { useState, useEffect, memo, useCallback } from "react";

import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";
import CvModal from "./CvModal.jsx";
import { openCvModal } from "../utils/cvModal.js";

const Header = memo(({ currentPath }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = { pathname: currentPath || (typeof window !== "undefined" ? window.location.pathname : "/") };

  // Global scroll progress bar across the entire site
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 15);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMenuOpen]);

  const handleNavLinkClick = () => setIsMenuOpen(false);

  const navItems = [
    { path: "/", label: "header.home" },
    { path: "/about", label: "header.about-me" },
    { path: "/trajectory", label: "header.trajectory" },
    { path: "/projects", label: "header.projects" },
    { path: "/blog", label: "header.blog" },
    { path: "/contact", label: "header.contact" },
    { path: "#cv", label: "header.cv", isCvModal: true },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { type: "tween", duration: 0.2, ease: "easeIn" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.2 } }),
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{
          scaleX,
          transformOrigin: "0%",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "var(--color-text)",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      />
      <header className="site-header">
        <nav
          aria-label="Navegación principal"
          className={`pill-nav ${scrolled && !isMenuOpen ? 'scrolled' : ''}`}
        >
          {/* Brand Mark */}
          <a href="/" className="logo-premium" onClick={handleNavLinkClick}>
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

          {/* Desktop Navigation Pills */}
          <ul className="nav-links-premium">
            {navItems.map((link) => (
              <li key={link.path}>
                <a 
                  href={link.path}
                  onClick={(e) => {
                    if (link.isCvModal) {
                      e.preventDefault();
                      openCvModal();
                    }
                  }}
                  className={`nav-item-premium ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {t(link.label)}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop Language Switcher */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
            <LanguageToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden"
            style={{
              background: isMenuOpen ? 'var(--color-text)' : 'var(--color-faint)',
              color: isMenuOpen ? 'var(--color-bg)' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '999px',
              width: '38px',
              height: '38px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            aria-label={isMenuOpen ? t("header.close-menu", "Cerrar menú") : t("header.open-menu", "Abrir menú")}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)', zIndex: 90 }}
              className="lg:hidden"
            />

            <motion.nav
              initial="hidden" animate="visible" exit="exit" variants={menuVariants}
              style={{
                position: 'fixed',
                top: '4.75rem',
                left: '12px',
                right: '12px',
                background: 'var(--color-surface)',
                zIndex: 95,
                border: '1px solid var(--color-border-strong)',
                borderRadius: '22px',
                boxShadow: 'var(--shadow-ambient-hover)',
                maxHeight: 'calc(100vh - 5.5rem)',
                overflowY: 'auto',
              }}
              className="lg:hidden"
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                {navItems.map((link) => (
                  <motion.div key={link.path} variants={itemVariants} onClick={(e) => {
                    if (link.isCvModal) {
                      e.preventDefault();
                      openCvModal();
                      setIsMenuOpen(false);
                    } else {
                      handleNavLinkClick();
                    }
                  }}>
                    <a 
                      href={link.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.9rem 1rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        borderRadius: '12px',
                        background: location.pathname === link.path ? 'var(--color-faint)' : 'transparent',
                        color: location.pathname === link.path ? 'var(--color-text)' : 'var(--color-text-muted)',
                        textDecoration: 'none',
                      }}
                    >
                      <span>{t(link.label)}</span>
                      {location.pathname === link.path && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text)' }} />
                      )}
                    </a>
                  </motion.div>
                ))}

                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <LanguageToggle size="lg" />
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <CvModal />
    </>
  );
});

Header.displayName = 'Header';
export default withProviders(Header);
