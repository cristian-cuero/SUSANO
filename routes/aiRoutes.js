const express = require('express');
const router = express.Router();
const { conversar } = require('../controllers/aiController');

// Definimos que cuando llegue una petición POST a "/" (que realmente será /api/ai/conversar)
// se ejecute la función conversar que acabamos de crear en el controlador.
router.post('/conversar', conversar);

module.exports = router;