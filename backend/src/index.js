// Starts the API:  connect to MongoDB → listen on PORT
import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import Item from './models/Item.js';
import { ensureDemoUsers, seedDatabase } from './seed/seedDatabase.js';

try {
  await connectDB(config.mongoUri);

  // First run on a new machine: fill the empty database with the sample data
  if ((await Item.estimatedDocumentCount()) === 0) {
    const counts = await seedDatabase();
    console.log(`🌱 Empty database – added ${counts.items} sample reports and ${counts.claims} claims.`);
  }
  // Older databases only had the DOSS account – add the student and super admin demo logins
  await ensureDemoUsers();

  app.listen(config.port, () => {
    console.log(`🚀 API running at http://localhost:${config.port}/api`);
  });
} catch (error) {
  console.error(`❌ Could not start the API: ${error.message}`);
  console.error('   Is MongoDB running? Check MONGODB_URI in backend/.env');
  process.exit(1);
}
