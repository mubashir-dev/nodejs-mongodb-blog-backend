const {
    body,
    check,
    validationResult
} = require("express-validator");
const Post = require("../models/post.model");
const mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;
const ObjectID = require('mongodb').ObjectID;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const {v4: uuidv4} = require('uuid');
const multer = require('multer');
const User = require("../models/user.model");
const PostCategory = require("../models/post.category.model");
//multer configuration
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads/posts');
    },
    filename: function (req, file, callback) {
        callback(null, uuidv4() + '-' + Date.now() + '.jpg');
    }
})

const upload = multer({storage: storage});
exports.upload = upload

exports.all = async (req, res, next) => {
    try {
        const result = await User.aggregate([
            {
                $lookup: {
                    from: "posts",
                    let: {"user_id": "$_id"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$user", "$$user_id"]}}},
                        {
                            $lookup: {
                                from: "comments",
                                let: {"post_id": "$_id", "createdAt": "comments.createdAt"},
                                pipeline: [
                                    {$match: {$expr: {$eq: ["$post", "$$post_id"]}}},
                                    {
                                        $addFields: {
                                            'postedAt': "$createdAt"
                                        }
                                    },
                                    {
                                        $project: {
                                            "_id": 0,
                                            "name": 1,
                                            "email": 1,
                                            "comment": 1,
                                            "postedAt": 1,
                                        }
                                    }
                                ],
                                as: "comments"
                            }
                        }],
                    as: "posts"
                },
            },
        ]);
        if (!result) {
            next(new httpError(200, {
                message: 'Record Not Found'
            }))
        }
        console.log(result);
        res.send({
            201: result
        });
    } catch
        (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
;
exports.index = [
    auth,
    async (req, res, next) => {
        try {
            const authUser = userData.user(req.headers.authorization);
            const result = await Post.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "Author",
                        pipeline: [
                            {
                                $project: {
                                    '_id': 1,
                                    'name': 1,
                                }
                            }
                        ]
                    },
                },
                {
                    $unwind: "$Author"
                },
                {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "post",
                        as: "comments",
                        pipeline: [
                            {
                                $project: {
                                    '_id': 1,
                                    'name': 1,
                                    'comment': 1,
                                    'createdAt': 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        '_id': 1,
                        'title': 1,
                        'Author By': "$Author.name",
                        "image": {$ifNull: [{$concat: [req.get('Host'), '$image']}, "N/A"]},
                        'body': 1,
                        'Comments': "$comments",
                        'createdAt': 1,
                        'updatedAt': 1,

                    }
                }
            ])
            if (!result) {
                next(new httpError(200, {
                    message: 'Record Not Found'
                }))
            }
            res.send({
                posts: result
            });
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
]
exports.find = [auth, async (req, res, next) => {
    try {
        const authUser = userData.user(req.headers.authorization);
        if (!ObjectId.isValid(req.params.id)) {
            next(new httpError(200, {
                message: 'Passed Post Id is invalid '
            }))

        } else {
            const result = await Post.findOne({
                _id: req.params.id,
                user: authUser._id
            });
            if (!result) {
                next(new httpError(200, {
                    message: 'Record Not Found'
                }))
            }
            res.send({
                data: result
            });
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
];
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
    body('category_id', 'Post Category  Id must be specified')
        .trim().custom((value, {
        req
    }) => {

        return PostCategory.findOne({
            _id: ObjectID(req.body.category_id)
        }).then(PostCategory => {
            if (!PostCategory) {
                return Promise.reject("Post Category has not been found.");
            }
        });
    }),
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
            } else if (!req.file) {
                next(new httpError(422, {
                    message: "Select Image for the post"
                }));
            } else {
                //upload file
                try {
                    upload.single('image')
                } catch (err) {
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
                res.status(200).send({post: result});
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    },
]
exports.update = [auth,
    body("title", "Post title must be specified.").isLength({
        min: 6
    }).trim(),

    body("body", "Post Body must be specified.").isLength({
        min: 200
    }).withMessage("Post body must be at least 200 characters long").trim(),
    body("tags", "Post must at least 1 tag.").isLength({
        min: 6
    }),
    body('category_id', 'Post Category  Id must be specified')
        .trim().custom((value, {
        req
    }) => {
        return PostCategory.findOne({
            _id: ObjectID(req.body.category_id)
        }).then(PostCategory => {
            if (!PostCategory) {
                return Promise.reject("Post Category has not been found.");
            }
        });
    }),
    async function (req, res, next) {
        const authUser = userData.user(req.headers.authorization);
        if (!ObjectId.isValid(req.params.id)) {
            next(new httpError(400, 'Passed Post Id is invalid'))
        } else {
            const foundPost = await Post.findOne({
                _id: req.params.id,
                user: authUser._id
            });
            if (!foundPost) {
                next(new httpError(404, 'Post not found against this ID'));
            } else {
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
                    } else {
                        //Checking if the file is present in request
                        if (req.file) {
                            try {
                                upload.single('image')
                            } catch (err) {
                                console.log("Error has occured while uploading file");
                            }
                            const Updatedpost = foundPost({
                                title: req.body.title,
                                image: "/public/posts/" + req.file.filename,
                                body: req.body.body,
                                tags: req.body.tags,
                                category: req.body.category_id,
                                user: authUser._id
                            });
                        } else {
                            const Updatedpost = foundPost({
                                title: req.body.title,
                                image: "/public/posts/" + req.file.filename,
                                body: req.body.body,
                                tags: req.body.tags,
                                category: req.body.category_id,
                                user: authUser._id
                            });
                        }

                        let result = await Updatedpost.update();
                        res.status(200).send({post: result});
                    }
                } catch (error) {
                    next(new httpError(500, {
                        message: error.message
                    }));
                }
            }
        }
    }
]
exports.delete = [auth,
    async (req, res, next) => {
        try {
            if (!ObjectId.isValid(req.params.id)) {
                next(new httpError(200, {
                    message: 'Passed Post Id is invalid '
                }))
            } else {
                const authUser = userData.user(req.headers.authorization);
                const result = await Post.findOneAndDelete({
                    _id: req.params.id,
                    user: authUser._id
                });
                if (!result) {
                    res.status(404).send({
                        message: 'Post Category has not been deleted'
                    });
                } else {
                    res.send({
                        message: 'Post Category has been deleted',
                        data: result
                    });
                }

            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }))
        }
    }
]
exports.deactivate = [auth,
    async (req, res, next) => {
        try {
            const userData = userData.user(req.headers.authorization);
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "Post must be specified"
                }));
            } else {
                let post = await Post.findOne({
                    _id: req.params.id,
                    user: userData._id
                });
                if (user) {
                    let result = await Post.findByIdAndUpdate({
                        _id: req.params.id,
                        user: userData._id
                    }, {
                        status: '0'
                    });
                    res.status(200).send({
                        user: result,
                        message: "The post has been deactivated"
                    });
                } else {
                    res.status(404).send({
                        message: "The Post has not been found"
                    });
                }
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
exports.activate = [auth,
    async (req, res, next) => {
        try {
            const userData = userData.user(req.headers.authorization);
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "The Post id must be specified"
                }));
            } else {
                let user = await Post.findOne({
                    _id: req.params.id,
                    user: userData._id
                });
                if (user) {
                    let result = await Post.findByIdAndUpdate({
                        _id: req.params.id,
                        user: userData._id
                    }, {
                        status: '1'
                    });
                    res.status(200).send({
                        user: result,
                        message: "The Post has been activated"
                    });

                } else {
                    res.status(404).send({
                        message: "The Post has not been found"
                    });
                }
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];