import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'GitHub upload');

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

console.log('Building website...');
execSync('npm.cmd run build', { cwd: root, stdio: 'inherit', shell: true });

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
  const dest = join(outDir, rel);
  copyPath(src, dest);
  console.log(`Copied: ${rel}`);
}

const fileCount = countFiles(outDir);
writeFileSync(
  join(outDir, 'UPLOAD INSTRUCTIONS.txt'),
  `FLEET CHECKLIST — UPLOAD THIS FOLDER TO GITHUB
================================================

Upload everything inside this "GitHub upload" folder to:
  https://github.com/cowaramupagencies/fleetchecklist

Do NOT upload node_modules, dist, or docs (not included).

LIVE WEBSITE (automatic)
------------------------
Pushing to the main branch triggers GitHub Actions, which builds and
publishes the site to the gh-pages branch.

GitHub → Settings → Pages:
  Branch: gh-pages
  Folder: / (root)

Site URL: https://cowaramupagencies.github.io/fleetchecklist/

FIREBASE (live site login)
--------------------------
Firebase Console → Authentication → Authorized domains → add:
  cowaramupagencies.github.io

Files in this folder: ${fileCount}
Generated: ${new Date().toLocaleString()}
`
);

console.log('');
console.log('========================================');
console.log(`Done! "GitHub upload" folder ready (${fileCount} files).`);
console.log('========================================');
