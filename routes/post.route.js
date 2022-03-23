const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController')

router.post('/add', PostController.upload.single("image"), PostController.create);
router.get('/', PostController.index);
router.get('/allpublicposts', PostController.all);
router.get('/:id', PostController.find);
router.put('/edit/:id', PostController.upload.single("image"), PostController.update);
router.delete('/:id', PostController.delete);
router.put('/deactivate/:id', PostController.deactivate);
router.put('/activate/:id', PostController.activate);

module.exports = router
