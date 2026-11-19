import { copyFileSync, existsSync } from 'node:fs';

const seed = new URL('./db.seed.json', import.meta.url);
const db = new URL('./db.json', import.meta.url);
const reset = process.argv.includes('--reset');

if (reset || !existsSync(db)) {
  copyFileSync(seed, db);
  console.log(reset ? 'API data reset to db.seed.json' : 'Created api/db.json from db.seed.json');
}
