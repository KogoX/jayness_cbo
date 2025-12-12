const path = require('path');
const fs = require('fs'); // <--- Import File System module
const express = require('express');
const multer = require('multer');

const router = express.Router();

// 1. Configure Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = 'uploads/';
    
    // Check if folder exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // Save to 'server/uploads'
  },
  filename(req, file, cb) {
    // Naming: fieldname-date.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. File Filter (Images Only)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

// 3. Init Upload
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. Route
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  // Replace backslashes for Windows compatibility
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

module.exports = router;