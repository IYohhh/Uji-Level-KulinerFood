
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');




const register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password) {
      return error(res, 'Nama, email, dan password wajib diisi.', 400);
    }

    if (password.length < 6) {
      return error(res, 'Password minimal 6 karakter.', 400);
    }

    // Register publik hanya boleh menjadi penjual atau pembeli.
    const userRole = role === 'penjual' ? 'penjual' : 'pembeli';

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return error(res, 'Email sudah digunakan.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (nama, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [nama, email, hashedPassword, userRole]
    );

    return success(res, 'Registrasi berhasil.', {
      id: result.insertId,
      nama,
      email,
      role: userRole
    }, 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal melakukan registrasi.');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email dan password wajib diisi.', 400);
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return error(res, 'Email atau password salah.', 401);
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return error(res, 'Email atau password salah.', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return success(res, 'Login berhasil.', {
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Gagal melakukan login.');
  }
};

module.exports = { register, login };
