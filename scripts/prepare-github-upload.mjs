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
writeFileSync(join(outDir, 'IMPORTANT - READ FIRST.txt'), `!!! YOUR SITE IS BUILT BUT GITHUB IS POINTING AT THE WRONG FOLDER !!!

The live website files are in the "docs" folder (already uploaded).
Local dev uses index.html in the main project — that file is NOT uploaded
on purpose (it causes the main.jsx error on GitHub).

FIX (takes 30 seconds):
1. Open: https://github.com/cowaramupagencies/fleetchecklist/settings/pages
2. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /docs          <-- MUST BE /docs NOT /(root)
3. Click Save
4. Wait 1-2 minutes
5. Open: https://cowaramupagencies.github.io/fleetchecklist/
6. Hard refresh: Ctrl+Shift+R

HOW TO CHECK IT WORKED:
- Right-click the page → View page source
- You should see: /fleetchecklist/assets/index-xxxxx.js
- You should NOT see: /src/main.jsx

Why local works but GitHub doesn't:
- Cursor runs "npm run dev" (development mode)
- GitHub must serve the BUILT files from the docs/ folder
`);

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

// Flat "website only" folder — upload to repo ROOT (works with Pages: main / root)
const websiteOnlyDir = join(root, 'GitHub upload - website only');
if (existsSync(websiteOnlyDir)) {
  rmSync(websiteOnlyDir, { recursive: true, force: true });
}
mkdirSync(websiteOnlyDir, { recursive: true });
cpSync(join(root, 'docs'), websiteOnlyDir, { recursive: true });

writeFileSync(
  join(websiteOnlyDir, 'READ ME FIRST.txt'),
  `UPLOAD THESE FILES TO THE ROOT OF YOUR GITHUB REPO
====================================================

This folder has the BUILT website (not source code).
Upload everything here to:
  https://github.com/cowaramupagencies/fleetchecklist

STEPS:
1. On GitHub, open your repo
2. DELETE the old "index.html" at the root (the one that breaks with main.jsx)
3. Click "Add file" → "Upload files"
4. Drag ALL files from THIS folder into GitHub (index.html, assets folder, etc.)
5. Commit

GITHUB PAGES SETTING:
  Settings → Pages → Deploy from branch → main → / (root)

That is probably what you already have — this upload is made for that.

SITE URL: https://cowaramupagencies.github.io/fleetchecklist/

After upload, hard refresh: Ctrl+Shift+R
`
);

console.log('');
console.log('========================================');
console.log(`Done! Two folders ready:`);
console.log(`  1. "GitHub upload" — full project (${fileCount} files)`);
console.log(`  2. "GitHub upload - website only" — JUST the live site (use this!)`);
console.log('========================================');
