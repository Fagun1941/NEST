import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
if (!['dev', 'start'].includes(mode)) {
  console.error('Usage: node scripts/run-apps.mjs <dev|start>');
  process.exit(1);
}

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error('Run this script using npm run dev or npm start.');
  process.exit(1);
}

const root = fileURLToPath(new URL('../', import.meta.url));
const children = [];
let stopping = false;
const apiPort = process.env.PORT ?? '3000';
const webPort = process.env.WEB_PORT ?? '3001';

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === 'win32') {
      // npm and the framework CLIs spawn children; stop the whole process tree.
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      killer.on('error', () => child.kill());
      killer.on('exit', (code) => {
        if (code !== 0 && child.exitCode === null) child.kill();
      });
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch (error) {
        if (error.code !== 'ESRCH') child.kill();
      }
    }
  }
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

for (const [directory, script] of [
  ['suhs', mode === 'dev' ? 'start:dev' : 'start:prod'],
  ['suhs-frontend', mode === 'dev' ? 'dev' : 'start'],
]) {
  const args = [npmCli, 'run', script];
  if (directory === 'suhs-frontend') args.push('--', '--port', webPort);
  const child = spawn(process.execPath, args, {
    cwd: fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    windowsHide: true,
    env: {
      ...process.env,
      PORT: apiPort,
      API_URL: process.env.API_URL ?? `http://127.0.0.1:${apiPort}`,
    },
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(`Could not start ${directory}: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.error(`${directory} stopped (${signal ?? code}). Stopping both apps.`);
      stop(code === 0 ? 0 : 1);
    }
  });
}

console.log(`Starting SUHS in ${mode} mode from ${root}`);
console.log(`Open http://localhost:${webPort} — API requests use /api. Press Ctrl+C to stop both apps.`);
