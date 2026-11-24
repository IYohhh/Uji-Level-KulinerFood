# KulinerHub Backend

REST API KulinerHub menggunakan Node.js, Express, dan MySQL. Flutter client
berada di folder [`../mobile`](../mobile/README.md).

## Menjalankan API

1. Jalankan `npm install`.
2. Salin `.env.example` menjadi `.env`, lalu isi konfigurasi database dan
   `JWT_SECRET`.
3. Jalankan `npm run db:setup` untuk membuat tabel serta data contoh.
4. Jalankan `npm run dev`.
5. Pastikan API merespons `GET http://localhost:3000/` sesuai nilai `PORT`
   pada `.env`.

API akan mencoba terhubung ke MySQL saat mulai berjalan. Endpoint health tersedia
di `GET http://localhost:3000/api/health`.

## Endpoint utama

- `POST /api/auth/register` dan `POST /api/auth/login`
- `GET /api/categories`; perubahan kategori memerlukan role `admin`
- `GET /api/products` dan `GET /api/products/:id`
- `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
  memerlukan role `penjual` dan header `Authorization` dengan JWT
- `GET /api/stores/my-store` dan `POST /api/stores` memerlukan role `penjual`
- Endpoint profil pengguna dan pesanan tersedia di `/api/users` dan `/api/orders`

Upload menu menggunakan field multipart `foto_produk`; format yang diterima
adalah JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB. Gambar tersimpan di
`uploads/products` dan tersedia melalui `/uploads`.

Registrasi publik hanya dapat membuat akun `penjual` atau `pembeli`. Akun admin
harus disiapkan oleh pengelola database; client tidak menaikkan role pengguna.

## Struktur

- `src/config`: konfigurasi database.
- `src/controllers`: logika aplikasi.
- `src/middleware`: autentikasi, role, dan upload.
- `src/routes`: endpoint API.
- `src/utils`: helper response JSON.
- `uploads`: file gambar yang diunggah.
