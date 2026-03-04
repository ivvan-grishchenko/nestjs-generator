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
    coverage: { enabled: false },
    environment: 'node',
    exclude: [...configDefaults.exclude],
    globals: true,
    include: ['test/**/*.e2e-spec.ts'],
    maxWorkers: '50%',
    pool: 'threads',
    root: './',
  },
});
