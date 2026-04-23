import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const files = [
  'index.html',
  'manifest.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
  'icon-svg(1).svg',
  'icon-svg(1)(1).svg',
  'icon-svg(1).png'
];

for (const file of files) {
  cpSync(resolve(root, file), resolve(dist, file));
}

console.log('Web build ready in ./dist');
