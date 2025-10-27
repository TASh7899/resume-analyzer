const express = require('express');
const router = express.Router();
const MainController = require("../controllers/MainController.js");

router.post('/download', MainController.generated_pdf);
router.post('/AI', MainController.MainAI);

module.exports = router;
