// src/utils/commentModeration.js
/**
 * Smart client-side moderation utility for Blog Comments.
 * Protects against profanity (ES/EN), spam links, and rapid flooding.
 */

const BLOCKED_WORDS = [
  // Español
  'puto', 'puta', 'pendejo', 'pendeja', 'mierda', 'cabron', 'cabrón',
  'chinga', 'chingar', 'verga', 'culero', 'culera', 'estupido', 'estúpido',
  'idiota', 'imbecil', 'imbécil', 'zorra', 'maricon', 'maricón', 'pinche',
  'mamada', 'jodete', 'jódete', 'malparido', 'gonorrea', 'hdp',
  // Inglés
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
  'whore', 'slut', 'motherfucker', 'nigger', 'faggot', 'retard',
  // Spam común
  'casino', 'viagra', 'crypto giveaway', 'free bitcoin', 'telegram.me', 't.me/'
];

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-z0-9-]+\.(com|net|org|ru|xyz|info|biz|top)\b)/i;

/**
 * Validates author name and comment content for inappropriate words, spam links, or length limits.
 * @param {string} authorName
 * @param {string} content
 * @returns {{ valid: boolean, reason?: string }}
 */
export const validateComment = (authorName, content) => {
  const cleanName = (authorName || '').trim();
  const cleanContent = (content || '').trim();

  if (cleanName.length < 2 || cleanName.length > 60) {
    return { valid: false, reason: 'invalid_name_length' };
  }

  if (cleanContent.length < 2 || cleanContent.length > 500) {
    return { valid: false, reason: 'invalid_content_length' };
  }

  // Block external URLs / spam links in comments
  if (URL_REGEX.test(cleanContent) || URL_REGEX.test(cleanName)) {
    return { valid: false, reason: 'links_not_allowed' };
  }

  // Normalize text (remove accents and leet-speak symbols) to check profanity
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[@4]/g, 'a')
      .replace(/[3]/g, 'e')
      .replace(/[1!]/g, 'i')
      .replace(/[0]/g, 'o');

  const combinedNormalized = `${normalize(cleanName)} ${normalize(cleanContent)}`;

  for (const word of BLOCKED_WORDS) {
    const normalizedWord = normalize(word);
    // Match whole word or clear substring for multi-word spam
    const regex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    if (regex.test(combinedNormalized)) {
      return { valid: false, reason: 'inappropriate_content' };
    }
  }

  return { valid: true };
};

const COOLDOWN_KEY = 'imaforbes_last_comment_ts';
const COOLDOWN_MS = 30 * 1000; // 30 seconds between comments

/**
 * Checks if the user is within the anti-spam cooldown window.
 * @returns {{ allowed: boolean, remainingSeconds: number }}
 */
export const checkCommentCooldown = () => {
  if (typeof window === 'undefined') return { allowed: true, remainingSeconds: 0 };
  try {
    const lastTs = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
    const elapsed = Date.now() - lastTs;
    if (elapsed < COOLDOWN_MS) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000),
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { allowed: true, remainingSeconds: 0 };
};

export const recordCommentTimestamp = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors
  }
};
