// Build-only ZIP exporter: npm run package:itch. Requires Node 26; no extra tools.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'dist');
const output = resolve(root, 'artifacts/dojo-itch.zip');
const files = [];
async function walk(dir) {
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Do not package symbolic links: ${path}`);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile()) files.push({ name: relative(source, path).split('\\').join('/'), data: await readFile(path) });
  }
}
await walk(source);
if (!files.some(f => f.name === 'index.html')) throw new Error('Build first: index.html must be at the ZIP root.');
const names = new Set();
const hashes = new Set();
for (const file of files) {
  if (names.has(file.name.toLowerCase())) throw new Error(`Duplicate/case-colliding filename: ${file.name}`);
  if (/(^|\/)(node_modules|original-runtime|\.git|\.env)(\/|$)|\.(tsx?|map|rtf)$/.test(file.name)) throw new Error(`Source/private file in build: ${file.name}`);
  names.add(file.name.toLowerCase());
  const hash = createHash('sha256').update(file.data).digest('hex');
  if (hashes.has(hash)) throw new Error(`Duplicate file content: ${file.name}`);
  hashes.add(hash);
}
const html = files.find(f => f.name === 'index.html').data.toString('utf8');
for (const [, attribute, url] of html.matchAll(/\b(src|href)="([^"]+)"/g)) {
  if (/^(?:https?:|data:|#)/.test(url)) continue; // Retain existing external HTTPS integrations.
  if (url.startsWith('/')) throw new Error(`itch.io needs relative ${attribute}: ${url}`);
  const path = url.replace(/^\.\//, '').split(/[?#]/)[0];
  if (!files.some(f => f.name === path)) throw new Error(`Missing referenced asset: ${url}`);
}

// ZIP format: each distinct built file once; no enclosing dist/ directory.
const chunks = [], central = [];
let offset = 0;
for (const file of files) {
  const name = Buffer.from(file.name, 'utf8');
  const data = deflateRawSync(file.data, { level: 9 });
  const checksum = crc32(file.data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x800, 6); local.writeUInt16LE(8, 8);
  local.writeUInt16LE(33, 12); // Stable DOS date: 1980-01-01.
  local.writeUInt32LE(checksum, 14); local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(file.data.length, 22); local.writeUInt16LE(name.length, 26);
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x800, 8); header.writeUInt16LE(8, 10); header.writeUInt16LE(33, 14);
  header.writeUInt32LE(checksum, 16); header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(file.data.length, 24); header.writeUInt16LE(name.length, 28);
  header.writeUInt32LE(offset, 42);
  chunks.push(local, name, data); central.push(header, name);
  offset += local.length + name.length + data.length;
}
const directory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
const archive = Buffer.concat([...chunks, directory, end]);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, archive);
const sha256 = createHash('sha256').update(archive).digest('hex');
await writeFile(`${output}.sha256`, `${sha256}  dojo-itch.zip\n`);
console.log(`Created dojo-itch.zip: ${files.length} unique files, ${archive.length} bytes. SHA-256: ${sha256}`);
