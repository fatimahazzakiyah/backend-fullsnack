const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "File gambar wajib diunggah." });
  }

  const maxSize = 2 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res
      .status(400)
      .json({ message: "Ukuran file terlalu besar. Maksimal 2MB." });
  }

  next();
};

module.exports = validateFile;
