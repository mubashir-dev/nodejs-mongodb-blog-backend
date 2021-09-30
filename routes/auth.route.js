const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')

router.post('/register', ProductController.register);
router.post('/login', ProductController.login);
router.get('/', ProductController.findall);
router.get('/:id', ProductController.find);
router.patch('/deactivate/:id', ProductController.deactivate);
router.patch('/activate/:id', ProductController.activate);

module.exports = router
