
const db = require('../config/database');
const { success, error } = require('../utils/response');

const createOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return error(res, 'Daftar produk pesanan wajib diisi.', 400);
    }

    await connection.beginTransaction();

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const jumlah = Number(item.jumlah);

      if (!Number.isInteger(jumlah) || jumlah <= 0) {
        throw new Error('Jumlah produk harus berupa bilangan positif.');
      }

      const [products] = await connection.query(
        'SELECT id, harga, stok FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error('Produk tidak ditemukan.');
      }

      const product = products[0];

      if (product.stok < jumlah) {
        throw new Error('Stok produk tidak mencukupi.');
      }

      const harga = Number(product.harga);
      const subtotal = harga * jumlah;

      total += subtotal;

      orderItems.push({
        product_id: product.id,
        jumlah,
        harga,
        subtotal
      });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_harga, status)
       VALUES (?, ?, 'menunggu')`,
      [req.user.id, total]
    );

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_details
         (order_id, product_id, jumlah, harga, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.product_id,
          item.jumlah,
          item.harga,
          item.subtotal
        ]
      );

      await connection.query(
        'UPDATE products SET stok = stok - ? WHERE id = ?',
        [item.jumlah, item.product_id]
      );
    }

    await connection.commit();

    return success(res, 'Pesanan berhasil dibuat.', {
      order_id: orderResult.insertId,
      total_harga: total,
      status: 'menunggu'
    }, 201);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return error(res, err.message || 'Gagal membuat pesanan.', 400);
  } finally {
    connection.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_details d
         WHERE d.order_id = o.id) AS jumlah_item,
        (SELECT GROUP_CONCAT(
           CONCAT(p.nama_produk, ' x ', d.jumlah)
           ORDER BY d.id SEPARATOR ', '
         )
         FROM order_details d
         JOIN products p ON p.id = d.product_id
         WHERE d.order_id = o.id) AS daftar_menu
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [req.user.id]
    );

    return success(res, 'Riwayat pesanan berhasil diambil.', orders);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil riwayat pesanan.');
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT DISTINCT o.*, u.nama AS nama_pembeli,
       (SELECT COUNT(*) FROM order_details item_count
        WHERE item_count.order_id = o.id) AS jumlah_item,
       (SELECT GROUP_CONCAT(
          CONCAT(menu.nama_produk, ' x ', menu_detail.jumlah)
          ORDER BY menu_detail.id SEPARATOR ', '
        )
        FROM order_details menu_detail
        JOIN products menu ON menu.id = menu_detail.product_id
        WHERE menu_detail.order_id = o.id) AS daftar_menu
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN order_details d ON o.id = d.order_id
       JOIN products p ON d.product_id = p.id
       JOIN stores s ON p.store_id = s.id
       WHERE s.user_id = ?
       ORDER BY o.id DESC`,
      [req.user.id]
    );

    return success(res, 'Pesanan toko berhasil diambil.', orders);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil pesanan toko.');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatus = [
      'menunggu',
      'diproses',
      'dikirim',
      'selesai',
      'dibatalkan'
    ];

    if (!allowedStatus.includes(status)) {
      return error(res, 'Status pesanan tidak valid.', 400);
    }

    const [orders] = await db.query(
      `SELECT DISTINCT o.id
       FROM orders o
       JOIN order_details d ON o.id = d.order_id
       JOIN products p ON d.product_id = p.id
       JOIN stores s ON p.store_id = s.id
       WHERE o.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return error(res, 'Pesanan tidak ditemukan.', 404);
    }

    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    return success(res, 'Status pesanan berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal memperbarui status pesanan.');
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus
};
