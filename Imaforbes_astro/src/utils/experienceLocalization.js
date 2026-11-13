// src/utils/experienceLocalization.js
// Bilingual localization and normalization for work experience entries (ES / EN)

const ALLEGRO_LOCALIZED = {
  es: {
    title: "Ingeniero de Software",
    company: "Allegro San Ángel Inn",
    location: "Ciudad de México, MX",
    period: "2025 - PRESENTE",
    description:
      "Como Ingeniero de Software enfocado en modernizar las operaciones de la notaría mediante el desarrollo de un sistema integral de gestión financiera y operativa a medida. Mis contribuciones clave incluyeron el levantamiento de requerimientos con el personal, el mapeo de procesos legales centrales (como operaciones inmobiliarias y testamentos) y el diseño de la arquitectura del sistema con módulos de CRM, automatización documental y control financiero.",
  },
  en: {
    title: "Software Engineer",
    company: "Allegro San Ángel Inn",
    location: "Mexico City, MX",
    period: "2025 - PRESENT",
    description:
      "As a Software Engineer focused on modernizing the notary's operations by developing a custom financial and operational management system. Key contributions included gathering requirements from staff, mapping out core legal processes (such as real estate transactions and wills), and designing the system's architecture to include modules for CRM, document automation, and financial control.",
  },
};

const CONSULTING_LOCALIZED = {
  es: {
    title: "Ingeniero Full-Stack y de Sistemas Senior",
    company: "Arquitectura y Consultoría Independiente",
    location: "Ciudad de México, MX",
    period: "2024 - PRESENTE",
    description:
      "Diseño y desarrollo de plataformas web de nivel empresarial, sistemas de punto de venta (POS) y mercados digitales. Liderando el ciclo completo de ingeniería desde el diseño de bases de datos relacionales (PostgreSQL, MySQL, SQLite) y APIs de alto rendimiento (FastAPI, PHP 8, Node.js) hasta interfaces reactivas con estética editorial refinada.",
  },
  en: {
    title: "Senior Full-Stack & Systems Engineer",
    company: "Independent Architecture & Consulting",
    location: "Mexico City, MX",
    period: "2024 - PRESENT",
    description:
      "Architecting and deploying enterprise-grade web platforms, point-of-sale (POS) ecosystems, and digital marketplaces. Leading full-lifecycle engineering from relational database design (PostgreSQL, MySQL, SQLite) and high-concurrency APIs (FastAPI, PHP 8, Node.js) to responsive React interfaces with refined editorial aesthetics.",
  },
};

const HOSPITALITY_LOCALIZED = {
  es: {
    title: "Desarrollador Web Full-Stack",
    company: "Soluciones Empresariales y de Hospitalidad",
    location: "México",
    period: "2022 - 2024",
    description:
      "Desarrollo de sistemas integrales de gestión para los sectores de hospitalidad, jurídico y comercial, incluyendo plataformas de reservaciones con control de acceso por roles (RBAC), automatización notarial y paneles de telemetría financiera en tiempo real.",
  },
  en: {
    title: "Full-Stack Web Developer",
    company: "Enterprise & Hospitality Solutions",
    location: "Mexico",
    period: "2022 - 2024",
    description:
      "Engineered comprehensive management systems for hospitality, legal, and retail sectors, including role-based access control (RBAC) resort booking engines, notary workflow automation, and real-time financial telemetry dashboards.",
  },
};

function localizePeriod(period, isSpanish) {
  if (!period || typeof period !== "string") return period || "";
  if (isSpanish) {
    return period
      .replace(/\bPRESENT\b/gi, "PRESENTE")
      .replace(/\bCURRENT\b/gi, "ACTUALMENTE");
  }
  return period
    .replace(/\bPRESENTE\b/gi, "PRESENT")
    .replace(/\bACTUALMENTE\b/gi, "PRESENT");
}

function localizeLocation(location, isSpanish) {
  if (!location || typeof location !== "string") return location || "";
  if (isSpanish) {
    return location
      .replace(/Mexico City/gi, "Ciudad de México")
      .replace(/\bMexico\b/g, "México");
  }
  return location
    .replace(/Ciudad de M[eé]xico/gi, "Mexico City")
    .replace(/\bM[eé]xico\b/g, "Mexico");
}

export function localizeExperience(exp, language = "es", t = null) {
  if (!exp || typeof exp !== "object") return exp;

  const isSpanish = String(language || "es").toLowerCase().startsWith("es");
  const langKey = isSpanish ? "es" : "en";

  const rawCompany = String(exp.company || "").toLowerCase();
  const rawTitle = String(exp.title || "").toLowerCase();
  const rawDesc = String(exp.description || "").toLowerCase();

  // 1. Check explicit bilingual fields on the record (if present in DB/fallback)
  if (exp[`title_${langKey}`] || exp[`description_${langKey}`]) {
    return {
      ...exp,
      title: exp[`title_${langKey}`] || exp.title,
      company: exp[`company_${langKey}`] || exp.company,
      location: exp[`location_${langKey}`] || localizeLocation(exp.location, isSpanish),
      period: exp[`period_${langKey}`] || localizePeriod(exp.period, isSpanish),
      description: exp[`description_${langKey}`] || exp.description,
    };
  }

  // 2. Match Allegro San Ángel Inn / Notary CRM experience from Supabase
  if (
    rawCompany.includes("allegro") ||
    rawTitle.includes("software enginner") ||
    rawDesc.includes("notary's operations") ||
    rawDesc.includes("operaciones de la notar")
  ) {
    const fallback = ALLEGRO_LOCALIZED[langKey];
    return {
      ...exp,
      title: t ? t("trajectory.items.allegro.title", fallback.title) : fallback.title,
      company: t ? t("trajectory.items.allegro.company", fallback.company) : fallback.company,
      location: t ? t("trajectory.items.allegro.location", fallback.location) : fallback.location,
      period: localizePeriod(exp.period || fallback.period, isSpanish),
      description: t
        ? t("trajectory.items.allegro.description", fallback.description)
        : fallback.description,
    };
  }

  // 3. Match Independent Architecture & Consulting fallback
  if (rawCompany.includes("independent architecture") || rawCompany.includes("arquitectura y consultor")) {
    const fallback = CONSULTING_LOCALIZED[langKey];
    return {
      ...exp,
      ...fallback,
      period: localizePeriod(exp.period || fallback.period, isSpanish),
    };
  }

  // 4. Match Enterprise & Hospitality Solutions fallback
  if (rawCompany.includes("hospitality") || rawCompany.includes("hospitalidad")) {
    const fallback = HOSPITALITY_LOCALIZED[langKey];
    return {
      ...exp,
      ...fallback,
      period: localizePeriod(exp.period || fallback.period, isSpanish),
    };
  }

  // 5. Generic normalization for any future Supabase record
  const fixedTitle = String(exp.title || "").replace(/Enginner/gi, "Engineer");
  return {
    ...exp,
    title: isSpanish
      ? fixedTitle.replace(/^Software Engineer$/i, "Ingeniero de Software")
      : fixedTitle,
    location: localizeLocation(exp.location, isSpanish),
    period: localizePeriod(exp.period, isSpanish),
  };
}
