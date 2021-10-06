const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController')

router.post('/add',CommentController.create);
router.put('/edit/:id',CommentController.update);
router.delete('/:id', CommentController.delete);
router.put('/deactivate/:id', CommentController.deactivate);
router.put('/activate/:id', CommentController.activate);

module.exports = router
