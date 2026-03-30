const express = require('express');
const router = express.Router();
const MainController = require("../controllers/MainController.js");
const multer = require("multer")

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/download', MainController.generated_pdf);
router.post('/AI', MainController.MainAI);
router.post('/set-key', MainController.setApiKey);
router.post('/parse', upload.single('resumePdf'), MainController.parsePDF);

module.exports = router;
