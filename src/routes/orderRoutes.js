
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus
} = require('../controllers/orderController');

router.use(authMiddleware);

router.post('/', roleMiddleware('pembeli', 'penjual'), createOrder);
router.get('/my-orders', roleMiddleware('pembeli'), getMyOrders);
router.get('/seller-orders', roleMiddleware('penjual'), getSellerOrders);
router.patch(
  '/:id/status',
  roleMiddleware('penjual'),
  updateOrderStatus
);

module.exports = router;
