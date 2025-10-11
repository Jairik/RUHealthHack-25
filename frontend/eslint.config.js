import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    plugins: { react: reactPlugin },
    extends: [js.configs.recommended],
    settings: { react: { version: 'detect' } },
  },
])
