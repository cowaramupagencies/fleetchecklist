import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

if (!existsSync('dist/index.html')) {
  console.error('Run vite build first — dist/index.html is missing.');
  process.exit(1);
}

// GitHub Pages SPA fallback
cpSync('dist/index.html', 'dist/404.html');

// Copy built site into docs/ for "main branch /docs" GitHub Pages
const docsDir = 'docs';
if (existsSync(docsDir)) {
  rmSync(docsDir, { recursive: true, force: true });
}
mkdirSync(docsDir, { recursive: true });
cpSync('dist', docsDir, { recursive: true });

console.log('Ready for GitHub Pages:');
console.log('  - dist/  (for gh-pages branch deploy)');
console.log('  - docs/  (upload to GitHub + set Pages to main /docs)');
