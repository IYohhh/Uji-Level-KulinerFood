
const db = require('../config/database');
const { success, error } = require('../utils/response');

const getStores = async (req, res) => {
  try {
    const [stores] = await db.query(
      `SELECT s.*, u.nama AS nama_penjual
       FROM stores s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.id DESC`
    );

    return success(res, 'Data toko berhasil diambil.', stores);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil data toko.');
  }
};

const getMyStore = async (req, res) => {
  try {
    const [stores] = await db.query(
      'SELECT * FROM stores WHERE user_id = ?',
      [req.user.id]
    );

    return success(res, 'Data toko berhasil diambil.', stores[0] || null);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil toko.');
  }
};

const createStore = async (req, res) => {
  try {
    const { nama_toko, deskripsi, alamat } = req.body;

    if (!nama_toko || !alamat) {
      return error(res, 'Nama toko dan alamat wajib diisi.', 400);
    }

    const [existing] = await db.query(
      'SELECT id FROM stores WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      return error(res, 'Kamu sudah memiliki toko.', 409);
    }

    const foto_toko = req.file
      ? `/uploads/stores/${req.file.filename}`
      : null;

    const [result] = await db.query(
      `INSERT INTO stores
       (user_id, nama_toko, deskripsi, alamat, foto_toko)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, nama_toko, deskripsi || null, alamat, foto_toko]
    );

    return success(res, 'Toko berhasil dibuat.', {
      id: result.insertId,
      nama_toko,
      deskripsi,
      alamat,
      foto_toko
    }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal membuat toko.');
  }
};

const updateStore = async (req, res) => {
  try {
    const { nama_toko, deskripsi, alamat } = req.body;

    const [stores] = await db.query(
      'SELECT * FROM stores WHERE user_id = ?',
      [req.user.id]
    );

    if (stores.length === 0) {
      return error(res, 'Toko tidak ditemukan.', 404);
    }

    const foto_toko = req.file
      ? `/uploads/stores/${req.file.filename}`
      : stores[0].foto_toko;

    await db.query(
      `UPDATE stores
       SET nama_toko = ?, deskripsi = ?, alamat = ?, foto_toko = ?
       WHERE user_id = ?`,
      [nama_toko, deskripsi || null, alamat, foto_toko, req.user.id]
    );

    return success(res, 'Toko berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal memperbarui toko.');
  }
};

module.exports = {
  getStores,
  getMyStore,
  createStore,
  updateStore
};
