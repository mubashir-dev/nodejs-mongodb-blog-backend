const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController')

router.post('/add', PostController.create);
// router.get('/', PostCategoryController.index);
// router.get('/:id', PostCategoryController.find);
// router.put('/edit/:id', PostCategoryController.update);
// router.delete('/:id', PostCategoryController.delete);
// router.put('/deactivate/:id', PostCategoryController.deactivate);
// router.put('/activate/:id', PostCategoryController.activate);

module.exports = router
