// Writes dist/build-version.json after `expo export` so the deployed web build
// exposes a version marker that hooks/useAutoUpdate.ts can poll for.
const fs = require('node:fs');
const path = require('node:path');

const version = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());
const buildTime = new Date().toISOString();

const outPath = path.join(__dirname, '..', 'dist', 'build-version.json');
fs.writeFileSync(outPath, JSON.stringify({ version, buildTime }, null, 2));

console.log(`Wrote ${outPath} (version=${version})`);
