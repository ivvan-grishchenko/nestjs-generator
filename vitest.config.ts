import swc from 'unplugin-swc';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  test: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
    bail: 1,
    coverage: {
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
    environment: 'node',
    exclude: [...configDefaults.exclude],
    globals: true,
    include: ['src/**/*.spec.ts'],
    maxWorkers: '50%',
    pool: 'threads',
    root: './',
  },
});
