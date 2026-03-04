import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// eslint-disable-next-line no-redeclare
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@suites',
  'doubles.vitest',
  'package.json',
);

if (!fs.existsSync(pkgPath)) process.exit(0);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mainExports = pkg.exports;
const hasUnitExport =
  typeof mainExports === 'object' &&
  mainExports !== null &&
  './unit' in mainExports;

if (hasUnitExport) process.exit(0);

const isSubpathFormat =
  typeof mainExports === 'object' && mainExports !== null && '.' in mainExports;

if (isSubpathFormat) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  pkg.exports = {
    ...mainExports,
    './unit': { types: './unit.d.ts' },
  };
} else {
  pkg.exports = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    '.': mainExports,
    './unit': { types: './unit.d.ts' },
  };
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
// eslint-disable-next-line no-console
console.log(
  'Suites: @suites/doubles.vitest exports patched for types "./unit"',
);
