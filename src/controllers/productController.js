
const db = require('../config/database');
const { success, error } = require('../utils/response');

const getProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, s.nama_toko, c.nama_kategori
       FROM products p
       JOIN stores s ON p.store_id = s.id
       JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );

    return success(res, 'Data produk berhasil diambil.', products);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil produk.');
  }
};

const getProductById = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, s.nama_toko, c.nama_kategori
       FROM products p
       JOIN stores s ON p.store_id = s.id
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return error(res, 'Produk tidak ditemukan.', 404);
    }

    return success(res, 'Detail produk berhasil diambil.', products[0]);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil detail produk.');
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      nama_produk,
      deskripsi,
      harga,
      stok
    } = req.body;

    if (!category_id || !nama_produk || harga === undefined || stok === undefined) {
      return error(res, 'Kategori, nama, harga, dan stok wajib diisi.', 400);
    }

    if (Number(harga) < 0 || Number(stok) < 0) {
      return error(res, 'Harga dan stok tidak boleh negatif.', 400);
    }

    const [stores] = await db.query(
      'SELECT id FROM stores WHERE user_id = ?',
      [req.user.id]
    );

    if (stores.length === 0) {
      return error(res, 'Buat toko terlebih dahulu.', 400);
    }

    const foto_produk = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;

    const [result] = await db.query(
      `INSERT INTO products
       (store_id, category_id, nama_produk, deskripsi, harga, stok, foto_produk)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        stores[0].id,
        category_id,
        nama_produk,
        deskripsi || null,
        harga,
        stok,
        foto_produk
      ]
    );

    return success(res, 'Produk berhasil ditambahkan.', {
      id: result.insertId,
      nama_produk,
      harga,
      stok,
      foto_produk
    }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menambahkan produk.');
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      category_id,
      nama_produk,
      deskripsi,
      harga,
      stok
    } = req.body;

    const [products] = await db.query(
      `SELECT p.* FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (products.length === 0) {
      return error(res, 'Produk tidak ditemukan atau bukan milikmu.', 404);
    }

    if (
      (harga !== undefined && Number(harga) < 0) ||
      (stok !== undefined && Number(stok) < 0)
    ) {
      return error(res, 'Harga dan stok tidak boleh negatif.', 400);
    }

    const old = products[0];
    const foto_produk = req.file
      ? `/uploads/products/${req.file.filename}`
      : old.foto_produk;

    await db.query(
      `UPDATE products SET
       category_id = ?, nama_produk = ?, deskripsi = ?,
       harga = ?, stok = ?, foto_produk = ?
       WHERE id = ?`,
      [
        category_id ?? old.category_id,
        nama_produk ?? old.nama_produk,
        deskripsi ?? old.deskripsi,
        harga ?? old.harga,
        stok ?? old.stok,
        foto_produk,
        req.params.id
      ]
    );

    return success(res, 'Produk berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal memperbarui produk.');
  }
};

const deleteProduct = async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.id FROM products p
       JOIN stores s ON p.store_id = s.id
       WHERE p.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (products.length === 0) {
      return error(res, 'Produk tidak ditemukan atau bukan milikmu.', 404);
    }

    await db.query(
      'DELETE FROM products WHERE id = ?',
      [req.params.id]
    );

    return success(res, 'Produk berhasil dihapus.');
  } catch (err) {
    console.error(err);
    return error(res, 'Produk gagal dihapus. Mungkin sudah ada dalam pesanan.');
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
