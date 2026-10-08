import re

with open('src/pages_react/HomePage.jsx', 'r') as f:
    content = f.read()

old_actions = """        <motion.div variants={itemVariants} className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <a href="/projects" className="btn-premium dark:bg-[#111] dark:border-strong" style={{ padding: '0.75rem 1.75rem', borderRadius: '9999px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              <span className="btn-icon">
                <FiCode /> {t("home.view-projects")} <FiArrowRight />
              </span>
            </a>
          </BorderBeam>
          
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <a href="/contact" className="btn-premium dark:bg-[#111] dark:border-strong" style={{ padding: '0.75rem 1.75rem', borderRadius: '9999px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              <span className="btn-icon">
                <FiMail /> {t("home.contact")}
              </span>
            </a>
          </BorderBeam>

          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <a href="/trajectory" className="btn-premium dark:bg-[#111] dark:border-strong" style={{ padding: '0.75rem 1.75rem', borderRadius: '9999px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              <span className="btn-icon">
                <FiBriefcase /> {t("home.view-trajectory")}
              </span>
            </a>
          </BorderBeam>
        </motion.div>"""

new_actions = """        <motion.div variants={itemVariants} className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginTop: '3rem' }}>
          {/* Primary CTA: Von Restorff Effect (Isolation) */}
          <BorderBeam theme="dark" size="sm" duration={3} colorVariant="ocean" className="rounded-full">
            <a href="/projects" className="btn-premium shadow-lg" style={{ padding: '0.85rem 2rem', borderRadius: '9999px', background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', fontWeight: 600 }}>
              <span className="btn-icon">
                <FiCode /> {t("home.view-projects")} <FiArrowRight />
              </span>
            </a>
          </BorderBeam>
          
          {/* Secondary CTA: Hick's Law (Reduce cognitive load by de-emphasizing secondary options) */}
          <a href="/contact" className="btn-premium dark:hover:bg-[#111] hover:bg-surface transition-colors" style={{ padding: '0.85rem 1.75rem', borderRadius: '9999px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <span className="btn-icon">
              <FiMail /> {t("home.contact")}
            </span>
          </a>

          {/* Tertiary CTA */}
          <a href="/trajectory" className="btn-premium dark:hover:bg-[#111] hover:bg-surface transition-colors" style={{ padding: '0.85rem 1.75rem', borderRadius: '9999px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <span className="btn-icon">
              <FiBriefcase /> {t("home.view-trajectory")}
            </span>
          </a>
        </motion.div>"""

content = content.replace(old_actions, new_actions)

with open('src/pages_react/HomePage.jsx', 'w') as f:
    f.write(content)
