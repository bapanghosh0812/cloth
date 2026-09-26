import mongoose from 'mongoose';
import { CATALOG } from '../../shared/catalog.js';
import { Product } from './models/Product.js';

// Upserts every catalogue product (matched by sku) and hides products no longer in the catalogue.
export const syncCatalog = async () => {
  const ops = CATALOG.map(({ id, ...fields }, position) => ({
    updateOne: {
      filter: { sku: id },
      update: { $set: { ...fields, sku: id, position, active: true } },
      upsert: true,
    },
  }));
  const result = await Product.bulkWrite(ops);
  const hidden = await Product.updateMany(
    { sku: mongoose.trusted({ $nin: CATALOG.map((p) => p.id) }), active: true },
    { $set: { active: false } }
  );
  return { inserted: result.upsertedCount, updated: result.modifiedCount, hidden: hidden.modifiedCount, total: CATALOG.length };
};

// First boot against an empty database: fill the shop automatically.
export const ensureCatalog = async () => {
  if ((await Product.estimatedDocumentCount()) > 0) return null;
  return syncCatalog();
};
