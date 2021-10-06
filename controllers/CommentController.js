const {
    body,
    check,
    validationResult
} = require("express-validator");
const Comment = require("../models/comment.model");
const mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");

// exports.index = [
//     auth,
//     async (req, res, next) => {
//         try {
//             const authUser = userData.user(req.headers.authorization);
//             const result = await PostCategory.find({
//                 user: authUser._id
//             });
//             if (!result) {
//                 next(new httpError(200, {
//                     message: 'Record Not Found'
//                 }))
//             }
//             res.send({
//                 data: result
//             });
//         } catch (error) {
//             next(new httpError(500, {
//                 message: error.message
//             }));
//         }
//     }
// ]

// exports.find = async (req, res, next) => {
//     try {
//         const authUser = userData.user(req.headers.authorization);
//         if (!ObjectId.isValid(req.params.id)) {
//             next(new httpError(200, {
//                 message: 'Passed Post Category Id is invalid '
//             }))

//         } else {
//             const result = await PostCategory.findOne({
//                 _id: req.params.id,
//                 user: authUser._id
//             });
//             if (!result) {
//                 next(new httpError(200, {
//                     message: 'Record Not Found'
//                 }))
//             }
//             res.send({
//                 data: result
//             });
//         }
//     } catch (error) {
//         next(new httpError(500, {
//             message: error.message
//         }));
//     }
// };

exports.create = [
    body("email", "Email must not be empty.").isEmail().trim(),
    body("name", "Name must not be empty.").isLength({ min: 6 }).trim(),
    body("comment", "Comment must not be empty.").isLength({
        min: 6
    }).withMessage("Comment should be at least 6 character long"),
    body("post_id", "Post Id must not be empty."),
    async function (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let _errors = [];
                errors.array().forEach((element) => {
                    _errors.push(element.msg);
                });
                next(new httpError(422, {
                    message: _errors
                }));
            } else {
                const comment = new Comment({
                    name: req.body.name,
                    email: req.body.email,
                    comment: req.body.comment,
                    comment: req.body.post_id
                });
                const result = await comment.save();
                res.status(200).send({ message: "Your Comment has been posted", comment: result });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    },
]

exports.update = [
    body("email", "Email must not be empty.").isEmail().trim(),
    body("name", "Name must not be empty.").isLength({ min: 6 }).trim(),
    body("comment", "Comment must not be empty.").isLength({
        min: 6
    }).withMessage("Comment should be at least 6 character long"),
    body("post_id", "Post Id must not be empty."),
    async function (req, res, next) {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                next(new httpError(200, {
                    message: 'Passed Comment Id is invalid '
                }))
            } else {
                const foundComment = await Comment.findOne({
                    _id: req.params.id
                })
                if (!foundComment) {
                    next(new httpError(404, 'Comment not found against this ID'));
                } else {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        let _errors = [];
                        errors.array().forEach((element) => {
                            _errors.push(element.msg);
                        });
                        next(new httpError(200, {
                            message: _errors
                        }));
                    } else {
                        const result = await Comment.findByIdAndUpdate(req.params.id, req.body);
                        res.send({
                            message: 'Your comment has been edited',
                            data: result
                        });
                    }

                }
            }

        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    },
]

exports.delete = [
    async (req, res, next) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                next(new httpError(200, {
                    message: 'Passed Comment Id is invalid '
                }))
            } else {
                const result = await Comment.findByIdAndDelete(req.params.id);
                res.send({
                    message: 'Comment has been deleted',
                    data: result
                });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }))
        }
    }
]

//Deactivate comment
exports.deactivate = [auth,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "Comment Id must be specified"
                }));
            } else {
                    let result = await Comment.findByIdAndUpdate({
                        _id: req.params.id,
                    }, {
                        status: '0'
                    });
                    res.status(200).send({
                        user: result,
                        message: "The Comment has been deactivated"
                    });
                } 
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//activate comment
exports.activate = [auth,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "Comment Id must be specified"
                }));
            } else {
                    let result = await Comment.findByIdAndUpdate({
                        _id: req.params.id,
                    }, {
                        status: '1'
                    });
                    res.status(200).send({
                        user: result,
                        message: "The Comment has been activated"
                    });
                } 
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];