import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'GitHub upload');

// Only what GitHub needs — no node_modules, dist, or docs
const COPY_PATHS = [
  'src',
  'public',
  '.github',
  'scripts',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'eslint.config.js',
  'firestore.rules',
  'storage.rules',
  'firestore.indexes.json',
  'README.md',
  '.env.example',
  '.env.production',
  '.gitignore',
  'index.html',
  'prepare-github-upload.cmd',
];

function copyPath(src, dest) {
  cpSync(src, dest, { recursive: true });
}

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) n += countFiles(p);
    else n += 1;
  }
  return n;
}

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

for (const rel of COPY_PATHS) {
  const src = join(root, rel);
  if (!existsSync(src)) {
    console.warn(`Skip (not found): ${rel}`);
    continue;
  }
  copyPath(src, join(outDir, rel));
  console.log(`Copied: ${rel}`);
}

const fileCount = countFiles(outDir);

writeFileSync(
  join(outDir, 'UPLOAD INSTRUCTIONS.txt'),
  `UPLOAD THIS FOLDER TO GITHUB
==============================

Repo: https://github.com/cowaramupagencies/fleetchecklist

1. Open your repo on GitHub (main branch)
2. Add file → Upload files
3. Drag EVERYTHING from this folder into GitHub
4. Commit

Files in this folder: ${fileCount}
(About 90 files — NOT 20,000. node_modules is not included.)

GitHub will build the live website automatically when you upload.
Live site: https://cowaramupagencies.github.io/fleetchecklist/

To refresh this folder after changes, double-click prepare-github-upload.cmd
in the main FleetCheck folder.

Generated: ${new Date().toLocaleString()}
`
);

console.log('');
console.log(`Done! "GitHub upload" folder ready (${fileCount} files).`);
console.log('Upload everything inside it to GitHub — do NOT upload node_modules.');
