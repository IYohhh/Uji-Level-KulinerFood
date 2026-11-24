
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadProduct } = require('../middleware/uploadMiddleware');

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('penjual'),
  uploadProduct.single('foto_produk'),
  createProduct
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('penjual'),
  uploadProduct.single('foto_produk'),
  updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('penjual'),
  deleteProduct
);

module.exports = router;
