import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  {
    // ビルド成果物や依存は対象外
    ignores: ['build/**', 'dist/**', 'node_modules/**', 'public/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  prettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      // eslint-plugin-react の 'detect' は ESLint 10 で削除された getFilename を
      // 参照しクラッシュするため、バージョンを明示する
      react: { version: '19' },
    },
    rules: {
      // 旧 .eslintrc.json の設定を踏襲（既存コードの記法を許容する）
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-children-prop': 'off',
      'react/no-unescaped-entities': 'off',
      // ESLint 10 で追加された厳格ルール。既存の throw 記法を許容する
      'preserve-caught-error': 'off',
    },
  },
);
