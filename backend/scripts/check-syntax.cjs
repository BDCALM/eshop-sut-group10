const { readdirSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['node_modules', 'coverage', 'test-results', '.git']);
function sources(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return ignored.has(entry.name) ? [] : sources(file);
    return entry.isFile() && /\.(?:js|cjs)$/.test(entry.name) ? [file] : [];
  });
}

const files = sources(root).sort();
if (files.length === 0) throw new Error('No JavaScript sources found');
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  const name = path.relative(root, file);
  if (result.error || result.status !== 0) {
    failed = true;
    console.error(`FAIL ${name}`);
    console.error(result.error ? result.error.message : result.stderr);
  } else {
    console.log(`PASS ${name}`);
  }
}
console.log(`Source syntax validation: ${files.length} files, ${failed ? 'FAIL' : 'PASS'}`);
process.exitCode = failed ? 1 : 0;
