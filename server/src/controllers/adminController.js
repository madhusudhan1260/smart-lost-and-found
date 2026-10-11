// POST /api/admin/reset – DOSS restores the sample data ("Reset demo data" button)
import { seedDatabase } from '../seed/seedDatabase.js';

export async function resetData(_req, res) {
  const counts = await seedDatabase();
  res.json({ message: 'Demo data restored.', ...counts });
}
