const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadChat } = require("../controllers/chatController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});
const upload = multer({ storage });

router.post("/upload", (req, res, next) => {
  upload.single("chatFile")(req, res, (err) => {
    if (err) return next(err);
    return uploadChat(req, res, next);
  });
});

module.exports = router;

