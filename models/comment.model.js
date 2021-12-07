const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CommentSchema Schema
const CommentSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    comment: {
        type: String,
        require: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    status: {
        type: String,
        enum: ['1', '0'],
        default: '1',
        require: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Comment", CommentSchema)