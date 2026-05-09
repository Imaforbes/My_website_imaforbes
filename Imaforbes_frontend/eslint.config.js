import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // NOTE: JSX member expressions like <motion.div> may be flagged as unused by core no-unused-vars.
      // We allow these common identifiers to avoid false positives.
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|AnimatePresence)$|^[A-Z_]' }],
    },
  },
  // Node scripts (deployment helpers)
  {
    files: ['deploy.js', 'prepare-for-hostinger.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
