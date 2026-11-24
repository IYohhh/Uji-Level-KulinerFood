
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadStore } = require('../middleware/uploadMiddleware');

const {
  getStores,
  getMyStore,
  createStore,
  updateStore
} = require('../controllers/storeController');

router.get('/', getStores);
router.get('/my-store', authMiddleware, roleMiddleware('penjual'), getMyStore);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('penjual'),
  uploadStore.single('foto_toko'),
  createStore
);
router.put(
  '/my-store',
  authMiddleware,
  roleMiddleware('penjual'),
  uploadStore.single('foto_toko'),
  updateStore
);

module.exports = router;
