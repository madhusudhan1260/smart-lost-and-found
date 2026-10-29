// GET /api/stats – counts calculated inside MongoDB with the aggregation pipeline
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';

export async function getStats(_req, res) {
  const [itemsByTypeAndStatus, claimsByStatus, itemsByCategory] = await Promise.all([
    // $group = "GROUP BY" in SQL
    Item.aggregate([
      { $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.type': 1, '_id.status': 1 } },
    ]),
    Claim.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const total = (rows, test) => rows.filter(test).reduce((sum, row) => sum + row.count, 0);

  res.json({
    items: {
      total: total(itemsByTypeAndStatus, () => true),
      lost: total(itemsByTypeAndStatus, (row) => row._id.type === 'lost'),
      found: total(itemsByTypeAndStatus, (row) => row._id.type === 'found'),
      byTypeAndStatus: itemsByTypeAndStatus.map(({ _id, count }) => ({ ..._id, count })),
      byCategory: itemsByCategory.map(({ _id, count }) => ({ category: _id, count })),
    },
    claims: Object.fromEntries(claimsByStatus.map(({ _id, count }) => [_id, count])),
  });
}
