import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
    ignores: [
      '.next/**',
      '**/.next/**',
      'node_modules/**',
      'tsconfig.tsbuildinfo',
      '.worktrees/**',
      '.worktrees/**/*',
      '**/.worktrees/**',
      '**/.worktrees/**/*',
    ],
  },
];

export default config;
