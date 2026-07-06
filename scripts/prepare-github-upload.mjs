import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const outDir = join(root, 'GitHub upload');

const COPY_PATHS = [
  'src',
  'public',
  'docs',
  '.github',
  'scripts',
  'index.html',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'eslint.config.js',
  'firestore.rules',
  'storage.rules',
  'vercel.json',
  'README.md',
  '.env.example',
  '.env.production',
  '.gitignore',
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

console.log('Building website for GitHub Pages...');
execSync('npm.cmd run build:pages', { cwd: root, stdio: 'inherit', shell: true });

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
const instructions = `FLEET CHECKLIST — UPLOAD THIS ENTIRE FOLDER TO GITHUB
============================================================

Upload everything inside this "GitHub upload" folder to:
  https://github.com/cowaramupagencies/fleetchecklist

Do NOT upload node_modules (not included).

GITHUB PAGES SETUP (one time)
-----------------------------
1. GitHub repo → Settings → Pages
2. Source: Deploy from branch
3. Branch: main
4. Folder: /docs
5. Save

Your site: https://cowaramupagencies.github.io/fleetchecklist/

AFTER YOU CHANGE THE APP LOCALLY
--------------------------------
Double-click "prepare-github-upload.cmd" in the main FleetCheck folder.
Then upload this folder again to GitHub.

FIREBASE (live site login)
--------------------------
Firebase Console → Authentication → Authorized domains → add:
  cowaramupagencies.github.io

Files in this folder: ${fileCount}
Generated: ${new Date().toLocaleString()}
`;

writeFileSync(join(outDir, 'UPLOAD INSTRUCTIONS.txt'), instructions);

console.log('');
console.log('========================================');
console.log(`Done! GitHub upload folder is ready.`);
console.log(`Files to upload: ${fileCount}`);
console.log('========================================');
