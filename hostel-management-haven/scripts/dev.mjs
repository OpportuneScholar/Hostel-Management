import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { MongoMemoryServer } from 'mongodb-memory-server';
import 'dotenv/config';
let mongo;
if (!process.env.MONGODB_URI) {
  await mkdir('.data/mongo', { recursive: true });
  mongo = await MongoMemoryServer.create({ binary: { version: '7.0.24', ...(process.platform === 'linux' ? { os: { os: 'linux', dist: 'ubuntu', release: '22.04' } } : {}) }, instance: { dbPath: `${process.cwd()}/.data/mongo`, storageEngine: 'wiredTiger', dbName: 'haven' } });
  process.env.MONGODB_URI = mongo.getUri('haven');
}
const children = [
  spawn(process.execPath, ['--watch', 'server/src/index.js'], { stdio: 'inherit', env: { ...process.env, SEED_DEMO: process.env.SEED_DEMO || 'true' } }),
  spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--workspace', 'client'], { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' })
];
children.forEach(child => child.on('error', error => { console.error('Could not start a process:', error.message); stop(1); }));
if ((process.env.SEED_DEMO || 'true') === 'true') console.log('\nDemo login  ->  warden@example.com  or  aarav.sharma@example.com   password: Haven@2026\n');
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(child => child.kill('SIGTERM'));
  if (mongo) await mongo.stop({ doCleanup: false });
  process.exit(code);
}
children.forEach(child => child.on('exit', code => { if (!stopping) stop(code || 0); }));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
