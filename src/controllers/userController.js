
const db = require('../config/database');
const { success, error } = require('../utils/response');

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nama, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return error(res, 'Pengguna tidak ditemukan.', 404);
    }

    return success(res, 'Profil berhasil diambil.', users[0]);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal mengambil profil.');
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama) {
      return error(res, 'Nama wajib diisi.', 400);
    }

    await db.query(
      'UPDATE users SET nama = ? WHERE id = ?',
      [nama, req.user.id]
    );

    return success(res, 'Profil berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal memperbarui profil.');
  }
};

module.exports = { getProfile, updateProfile };
