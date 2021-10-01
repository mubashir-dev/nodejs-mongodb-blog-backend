const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//PostCategory Schema
const PostCategorySchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        maxLength: 255,
    },
    status: {
        type: String,
        enum: ['1', '0'],
        default: '1',
        require: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("PostCategory", PostCategorySchema)