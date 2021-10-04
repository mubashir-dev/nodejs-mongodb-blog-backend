const {
    body,
    check,
    validationResult
} = require("express-validator");
const Post = require("../models/post.model");
const mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const { v4: uuidv4 } = require('uuid');

const multer = require('multer');
//multer configuration
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads/posts');
    },
    filename: function (req, file, callback) {
        callback(null, uuidv4() + '-' + Date.now() + '.jpg');
    }
})

const upload = multer({ storage: storage });
exports.upload = upload



//upload for post image
// var upload = multer({ storage: storage }).single('image');

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
exports.create = [auth,
    body("title", "Post title must be specified.").isLength({
        min: 6
    }).trim(),

    body("body", "Post Body must be specified.").isLength({
        min: 200
    }).withMessage("Post body must be at least 200 characters long").trim(),
    body("tags", "Post must at least 1 tag.").isLength({
        min: 6
    }),
    check('category_id', 'Post Category  Id must be specified')
        .trim(),
    async function (req, res, next) {
        try {
            const errors = validationResult(req);
            const authUser = userData.user(req.headers.authorization);
            if (!errors.isEmpty()) {
                let _errors = [];
                errors.array().forEach((element) => {
                    _errors.push(element.msg);
                });
                next(new httpError(422, {
                    message: _errors
                }));
            }
            else if (!req.file) {
                next(new httpError(422, {
                    message: "Select Image for the post"
                }));
            }
            else {
                //upload file
                try {

                }
                catch (err) {
                    console.log("Error has occured while uploading file");
                }
                const post = new Post({
                    title: req.body.title,
                    image: "/public/posts/" + req.file.filename,
                    body: req.body.body,
                    tags: req.body.tags,
                    category: req.body.category_id,
                    user: authUser._id
                });
                let result = await post.save();
                res.status(200).send({ post: result });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    },
]

// exports.update = [auth,
//     body("title", "Post Category title must be specified.").isLength({
//         min: 6
//     }).withMessage("Post Category title must be  at least 6 characters long").trim(),
//     async function (req, res, next) {

//         try {
//             if (!ObjectId.isValid(req.params.id)) {
//                 next(new httpError(200, {
//                     message: 'Passed Post Category Id is invalid '
//                 }))
//             } else {
//                 const foundPostCategory = await PostCategory.findOne({
//                     _id: req.params.id
//                 })
//                 if (!foundPostCategory) {
//                     next(new httpError(404, 'Post Category not found against this ID'));
//                 } else {
//                     const errors = validationResult(req);
//                     if (!errors.isEmpty()) {
//                         let _errors = [];
//                         errors.array().forEach((element) => {
//                             _errors.push(element.msg);
//                         });
//                         next(new httpError(200, {
//                             message: _errors
//                         }));
//                     } else {
//                         const result = await PostCategory.findByIdAndUpdate(req.params.id, req.body);
//                         res.send({
//                             message: 'Post Category has been updated successfully',
//                             data: result
//                         });
//                     }

//                 }
//             }

//         } catch (error) {
//             next(new httpError(500, {
//                 message: error.message
//             }));
//         }
//     },
// ]

// exports.delete = [auth,
//     async (req, res, next) => {
//         try {
//             if (!ObjectId.isValid(req.params.id)) {
//                 next(new httpError(200, {
//                     message: 'Passed Post Category Id is invalid '
//                 }))
//             } else {
//                 const result = await PostCategory.findByIdAndDelete(req.params.id);
//                 res.send({
//                     message: 'Post Category has been deleted',
//                     data: result
//                 });
//             }
//         } catch (error) {
//             next(new httpError(500, {
//                 message: error.message
//             }))
//         }
//     }
// ]

// //Deactivate post category
// exports.deactivate = [auth,
//     async (req, res, next) => {
//         try {
//             const errors = validationResult(req);
//             if (req.params.id == undefined) {
//                 next(new httpError(422, {
//                     message: "Post Category must be specified"
//                 }));
//             } else {
//                 let user = await User.findOne({
//                     _id: req.params.id
//                 });
//                 if (user) {
//                     const userData = userData.user(req.headers.authorization);
//                     let result = await PostCategory.findByIdAndUpdate({
//                         _id: req.params.id,
//                         user: userData._id
//                     }, {
//                         status: '0'
//                     });
//                     res.status(200).send({
//                         user: result,
//                         message: "The post category has been deactivated"
//                     });
//                     // if (userData.role == "admin") {
//                     //     let result = await User.findByIdAndUpdate({
//                     //         status: req.params.id
//                     //     }, {
//                     //         status: '0'
//                     //     });
//                     //     res.status(200).send({
//                     //         user: result,
//                     //         message: "The user has been deactivated"
//                     //     });
//                     // } else {
//                     //     res.status(200).send({
//                     //         message: "Permission denied"
//                     //     });
//                     // }

//                 } else {
//                     res.status(404).send({
//                         message: "The Post Category has not been found"
//                     });
//                 }
//             }
//         } catch (error) {
//             next(new httpError(500, {
//                 message: error.message
//             }));
//         }
//     }
// ];
// //activate post category
// exports.activate = [auth,
//     async (req, res, next) => {
//         try {
//             const errors = validationResult(req);
//             if (req.params.id == undefined) {
//                 next(new httpError(422, {
//                     message: "The Post Category id must be specified"
//                 }));
//             } else {
//                 let user = await User.findOne({
//                     _id: req.params.id
//                 });
//                 if (user) {
//                     const userData = userData.user(req.headers.authorization);
//                     let result = await PostCategory.findByIdAndUpdate({
//                         _id: req.params.id,
//                         user: userData._id
//                     }, {
//                         status: '1'
//                     });
//                     res.status(200).send({
//                         user: result,
//                         message: "The Post Category has been activated"
//                     });

//                 } else {
//                     res.status(404).send({
//                         message: "The Post Category has not been found"
//                     });
//                 }
//             }
//         } catch (error) {
//             next(new httpError(500, {
//                 message: error.message
//             }));
//         }
//     }
// ];