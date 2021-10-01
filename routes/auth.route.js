const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/', AuthController.findall);
router.get('/:id', AuthController.find);
router.patch('/deactivate/:id', AuthController.deactivate);
router.patch('/activate/:id', AuthController.activate);

module.exports = router
