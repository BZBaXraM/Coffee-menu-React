// Rebuild the Driver Game Center front-end (separate repo: GameCenterReact) and
// bundle its production build into public/driver-game-center/ so this app's nginx
// serves it at menyuqr.com/driver-game-center. Run this whenever the game-center
// source changes, then rebuild/redeploy this client image as usual.
//
//   node scripts/bundle-game-center.mjs
//
// The game-center repo location defaults to a sibling folder; override with
//   GAME_CENTER_DIR=/path/to/GameCenterReact node scripts/bundle-game-center.mjs
import { execSync } from 'node:child_process';
import { existsSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, '..');
const gcDir = process.env.GAME_CENTER_DIR
  ? path.resolve(process.env.GAME_CENTER_DIR)
  : path.resolve(clientRoot, '..', 'GameCenterReact');

if (!existsSync(path.join(gcDir, 'package.json'))) {
  console.error(`GameCenterReact not found at ${gcDir}.`);
  console.error('Set GAME_CENTER_DIR to its path and retry.');
  process.exit(1);
}

// Prefer bun (matches the game-center Dockerfile); fall back to npm.
function tool() {
  try { execSync('bun --version', { stdio: 'ignore' }); return 'bun'; }
  catch { return 'npm'; }
}
const run = tool();

console.log(`Building GameCenterReact with ${run} (${gcDir}) ...`);
if (!existsSync(path.join(gcDir, 'node_modules'))) {
  execSync(`${run} install`, { cwd: gcDir, stdio: 'inherit' });
}
execSync(`${run} run build`, { cwd: gcDir, stdio: 'inherit' });

const dist = path.join(gcDir, 'dist');
const dest = path.join(clientRoot, 'public', 'driver-game-center');
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(dist, dest, { recursive: true });

console.log(`Bundled game center -> ${path.relative(clientRoot, dest)}`);
console.log('Now rebuild + redeploy this client image (docker compose build && up).');
