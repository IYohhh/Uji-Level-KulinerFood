
const db = require('../config/database');
const { success, error } = require('../utils/response');

const getCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories ORDER BY id DESC'
    );

    return success(res, 'Data kategori berhasil diambil.', categories);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil kategori.');
  }
};

const createCategory = async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;

    if (!nama_kategori) {
      return error(res, 'Nama kategori wajib diisi.', 400);
    }

    const [result] = await db.query(
      'INSERT INTO categories (nama_kategori, deskripsi) VALUES (?, ?)',
      [nama_kategori, deskripsi || null]
    );

    return success(res, 'Kategori berhasil ditambahkan.', {
      id: result.insertId,
      nama_kategori,
      deskripsi
    }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal menambahkan kategori.');
  }
};

const updateCategory = async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;

    const [result] = await db.query(
      `UPDATE categories
       SET nama_kategori = ?, deskripsi = ?
       WHERE id = ?`,
      [nama_kategori, deskripsi || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Kategori tidak ditemukan.', 404);
    }

    return success(res, 'Kategori berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal memperbarui kategori.');
  }
};

const deleteCategory = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Kategori tidak ditemukan.', 404);
    }

    return success(res, 'Kategori berhasil dihapus.');
  } catch (err) {
    console.error(err);
    return error(res, 'Kategori gagal dihapus. Mungkin masih digunakan produk.');
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
