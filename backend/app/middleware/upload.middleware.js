import multer from "multer";

// Memory storage for file buffers
const uploadMulter = () => {
  return multer({
    storage: multer.memoryStorage(), // store files in memory
    limits: { fileSize: 200 * 1024 * 1024 }, // optional: 200MB limit per file
    fileFilter: (req, file, cb) => {
      // Accept images and videos only
      const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv/;
      if (allowed.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Unsupported file type"), false);
      }
    },
  });
};

export default uploadMulter;
