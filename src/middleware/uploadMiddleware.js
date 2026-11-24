
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folder);

  fs.mkdirSync(uploadPath, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(null, uniqueName + path.extname(file.originalname));
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format gambar harus JPG, PNG, atau WEBP.'));
  }
};

const uploadProduct = multer({
  storage: createStorage('products'),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const uploadStore = multer({
  storage: createStorage('stores'),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = { uploadProduct, uploadStore };
