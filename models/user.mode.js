const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//UserSchema
const UserSchema = new Schema({
    name: { type: String, require: true },
    image: { type: String, require: true },
    username: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    is_admin: { type: String, enum: ['1', '0'], require: true },
    status: { type: String, enum: ['1', '0'], require: true },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema)
