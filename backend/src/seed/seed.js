// Command-line seeder:  npm run seed   (inside the server folder)
import { config } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';

try {
  await connectDB(config.mongoUri);
  const counts = await seedDatabase();
  console.log(`🌱 Seeded ${counts.items} reports and ${counts.claims} claims.`);
  console.log(`🔑 DOSS login: ${config.dossEmail} / ${config.dossPassword}`);
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
