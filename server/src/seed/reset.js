// server/src/seed/reset.js
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { runSeed } from './seed.js';

async function resetAll() {
  const hasYes = process.argv.includes('--yes');
  if (!hasYes) {
    console.error('ERROR: To reset the database, you MUST pass --yes: npm run seed:reset -- --yes');
    process.exit(1);
  }

  await connectDB();
  console.log('--- Wiping all collections for reset ---');

  const collections = await mongoose.connection.db.collections();
  for (const col of collections) {
    console.log(`Dropping collection: ${col.collectionName}`);
    try {
      await col.drop();
    } catch (e) {
      console.warn(`Could not drop ${col.collectionName}: ${e.message}`);
    }
  }

  console.log('All collections dropped. Running full seed...');
  await runSeed({ wipeDemoOnly: false });
  console.log('Database reset and seeded successfully.');
  process.exit(0);
}

resetAll().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
