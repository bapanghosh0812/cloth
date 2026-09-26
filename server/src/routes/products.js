import { Router } from 'express';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/http.js';

export const productsRouter = () => {
  const router = Router();

  router.get('/', async (_req, res) => {
    const products = await Product.find({ active: true }).sort({ position: 1 });
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ products });
  });

  router.get('/:id', async (req, res) => {
    const product = await Product.findOne({ sku: String(req.params.id), active: true });
    if (!product) throw new HttpError(404, 'Product not found');
    res.json({ product });
  });

  return router;
};
