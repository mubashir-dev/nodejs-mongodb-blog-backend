const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Post Schema
const PostSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    body: {
        type: String,
        maxLength: 2000,
    },
    status: {
        type: String,
        enum: ['1', '0'],
        default: '1',
        require: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'PostCategory'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Post", PostSchema)