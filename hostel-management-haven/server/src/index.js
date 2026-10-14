import { config } from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import app from './app.js';
import { Room, Resident, Payment, Warden, Session, ServiceRequest } from './models.js';
import { seedDemo } from './seed.js';
import { prepareAccounts } from './auth.js';
// Load the .env from the project root even when the server is started from the server folder.
config({ path: [fileURLToPath(new URL('../../.env', import.meta.url)), '.env'] });
try { await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/haven', { serverSelectionTimeoutMS: 8000 }); }
catch (error) { console.error(`Cannot connect to MongoDB (${error.message}). Remove MONGODB_URI from .env to use the built-in local database, or start your MongoDB server.`); process.exit(1); }
await Promise.all([Room.init(), Resident.init(), Payment.init(), Warden.init(), Session.init(), ServiceRequest.init()]);
if (process.env.SEED_DEMO === 'true') await seedDemo();
await prepareAccounts();
const clientDist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('/{*path}', (req, res) => { res.set('Cache-Control', 'no-cache'); res.sendFile(`${clientDist}/index.html`); });
}
const server = app.listen(Number(process.env.PORT || 3001),'0.0.0.0', () => console.log('Haven API ready'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
