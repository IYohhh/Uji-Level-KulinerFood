require('dotenv').config();

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

const statements = fs
  .readFileSync(schemaPath, 'utf8')
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

async function insertIgnore(sql, values) {
  await db.query(sql, values);
}

async function setup() {
  for (const statement of statements) {
    await db.query(statement);
  }

  const passwordHash = await bcrypt.hash('123456', 10);
  const users = [
    ['Rio', 'rio12@gmail.com', passwordHash, 'penjual'],
    ['Dodo', 'dodo@gmail.com', passwordHash, 'pembeli'],
    ['Siti', 'siti@gmail.com', passwordHash, 'penjual'],
  ];

  for (const user of users) {
    await insertIgnore(
      'INSERT IGNORE INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      user
    );
  }

  const categories = [
    ['Dessert', 'Berbagai macam makanan penutup'],
    ['Makanan', 'Berbagai macam makanan berat'],
    ['Minuman', 'Berbagai macam minuman'],
    ['Snack', 'Berbagai macam makanan ringan'],
  ];

  for (const category of categories) {
    await insertIgnore(
      'INSERT IGNORE INTO categories (nama_kategori, deskripsi) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM categories WHERE nama_kategori = ?)',
      [category[0], category[1], category[0]]
    );
  }

  const [rioRows] = await db.query("SELECT id FROM users WHERE email = 'rio12@gmail.com'");
  const [sitiRows] = await db.query("SELECT id FROM users WHERE email = 'siti@gmail.com'");

  if (rioRows.length > 0) {
    await insertIgnore(
      'INSERT IGNORE INTO stores (user_id, nama_toko, deskripsi, alamat, foto_toko) VALUES (?, ?, ?, ?, ?)',
      [rioRows[0].id, 'Toko Rio Food', 'Menyediakan aneka makanan dan minuman', 'Depok, Jawa Barat', 'rio.jpg']
    );
  }

  if (sitiRows.length > 0) {
    await insertIgnore(
      'INSERT IGNORE INTO stores (user_id, nama_toko, deskripsi, alamat, foto_toko) VALUES (?, ?, ?, ?, ?)',
      [sitiRows[0].id, 'Siti Bakery', 'Menyediakan aneka roti dan kue', 'Jakarta, Indonesia', 'siti.jpg']
    );
  }

  console.log('Database setup berhasil.');
}

setup()
  .catch((error) => {
    console.error('Database setup gagal:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
