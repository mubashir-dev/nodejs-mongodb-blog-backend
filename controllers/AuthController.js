const {
    body,
    check,
    validationResult
} = require("express-validator");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");

//register user
exports.register = [
    body("name", "Name must not be empty.").isLength({
        min: 5
    }).trim(),
    body("password", "Password must not be empty.").isLength({
        min: 6
    }).trim(),
    check('confirmPassword').trim()
        .custom(async (confirmPassword, {
            req
        }) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Passwords must be same')
            }
        }),
    body("email", "Email must not be empty.").isEmail().trim().custom((value, {
        req
    }) => {
        return User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                return Promise.reject("Email already exists.");
            }
        });
    }),
    body("username", "Username must not be empty.").isLength({
        min: 1
    }).trim().custom((value, {
        req
    }) => {
        return User.findOne({
            username: req.body.username
        }).then(user => {
            if (user) {
                return Promise.reject("Username already exists.");
            }
        });
    }),
    async (req, res, next) => {
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
                let hash = await passwordHash.hash(req.body.password);
                const user = new User({
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash

                })
                const result = await user.save();
                res.status(200).send({
                    user: result
                });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];

//login
exports.login = [
    body("email", "Email is required.").isEmail().trim(),
    body("password", "Password is required.").isLength({
        min: 6
    }),
    async (req, res, next) => {
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
                const foundUser = await User.findOne({
                    email: req.body.email
                })
                if (!foundUser) {
                    next(new httpError(404, 'User is not found in our system'));
                }
                //Compare password
                let hashCompare = await passwordHash.compare(req.body.password, foundUser.password);

                if (hashCompare) {
                    //Check if user is active or suspended
                    if (foundUser.status == '1') {
                        let userData = {
                            _id: foundUser._id,
                            name: foundUser.name,
                            email: foundUser.email,
                            username: foundUser.username,
                            role: foundUser.role,
                            status: foundUser.status == 1 ? "Active" : "Suspend",
                        };
                        //Prepare JWT token for authentication
                        const jwtPayload = userData;
                        const jwtData = {
                            expiresIn: process.env.JWT_TIMEOUT_DURATION,
                        };
                        const secret = process.env.JWT_SECRET;
                        //Generated JWT token with Payload and secret.
                        userData.token = jwt.sign(jwtPayload, secret, jwtData);
                        res.status(200).send({
                            user: userData
                        })
                    } else {
                        next(new httpError(400, 'Your Account is not activated'));
                    }
                }
                next(new httpError(401, {
                    message: "Password or Email is not Correct"
                }));
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];

//get all users,this is only for admin
exports.index = [auth,
    async (req, res, next) => {
        try {
            const user = userData.user(req.headers.authorization);
            if (user.role == 'admin') {
                const result = await User.find({
                    status: "1"
                });
                res.send({
                    users: result,
                });
            } else {
                next(new httpError(401, {
                    message: "You don't have permissions to do this"
                }));
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];

//get single user,this is only for admin
exports.find = [auth,
    async (req, res, next) => {
        try {
            const user = userData.user(req.headers.authorization);
            if (user.role == 'admin') {
                const result = await User.findOne({
                    _id: req.params.id
                });
                if (result.status == "1") {
                    res.send({
                        user: result,
                    });
                }
                else {
                    res.send({
                        message: "This Account has been suspended",
                        user: result,

                    });
                }

            } else {
                next(new httpError(401, {
                    message: "You don't have permissions to do this"
                }));
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];

exports.update = [auth,
    body("name", "Name must not be empty.").isLength({
        min: 5
    }).trim(),
    body("email", "Email must not be empty.").isEmail().trim().custom((value, {
        req
    }) => {
        return User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                return Promise.reject("Email already exists.");
            }
        });
    }),
    body("username", "Username must not be empty.").isLength({
        min: 1
    }).trim().custom((value, {
        req
    }) => {
        return User.findOne({
            username: req.body.username
        }).then(user => {
            if (user) {
                return Promise.reject("Username already exists.");
            }
        });
    }),
    async (req, res, next) => {
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
                let result = await User.findByIdAndUpdate({
                    _id: req.params.id
                }, {
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email
                });
                res.status(200).send({
                    user: result,
                    message: "User Profile has been updated"
                });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
//get single user,this is only for amdin
exports.changePassword = [auth,
    body("password", "Password must not be empty.").isLength({
        min: 6
    }).withMessage("Password must be at least 6 characters").trim(),
    check('confirmPassword').trim()
        .custom(async (confirmPassword, {
            req
        }) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Passwords must be same')
            }
        }),
    async (req, res, next) => {
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
                let hash = await passwordHash.hash(req.body.password);
                let user = await User.findOne({
                    _id: req.params.id
                });
                if (user) {
                    let result = await User.findByIdAndUpdate({
                        _id: req.params.id
                    }, {
                        password: hash
                    });
                    res.status(200).send({
                        user: result,
                        message: "Your password has been updated"
                    });
                } else {
                    res.status(404).send({
                        message: "User has not been found"
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

//Deactivate user
exports.deactivate = [auth,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "User id must be passed"
                }));
            } else {
                let user = await User.findOne({
                    _id: req.params.id
                });
                if (user) {
                    //const userData = userData.userData(req.headers.authorization);
                    let result = await User.findByIdAndUpdate({
                        _id: req.params.id
                    }, {
                        status: '0'
                    });
                    res.status(200).send({
                        user: result,
                        message: "The user has been deactivated"
                    });
                    // if (userData.role == "admin") {
                    //     let result = await User.findByIdAndUpdate({
                    //         status: req.params.id
                    //     }, {
                    //         status: '0'
                    //     });
                    //     res.status(200).send({
                    //         user: result,
                    //         message: "The user has been deactivated"
                    //     });
                    // } else {
                    //     res.status(200).send({
                    //         message: "Permission denied"
                    //     });
                    // }

                } else {
                    res.status(404).send({
                        message: "User has not been found"
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
//activate user
exports.activate = [auth,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (req.params.id == undefined) {
                next(new httpError(422, {
                    message: "User id must be passed"
                }));
            } else {
                let user = await User.findOne({
                    _id: req.params.id
                });
                if (user) {
                    const authUser = userData.user(req.headers.authorization);
                    let result = await User.findByIdAndUpdate({
                        _id: req.params.id
                    }, {
                        status: '1'
                    });
                    res.status(200).send({
                        user: result,
                        message: "The user has been activated"
                    });
                    if (authUser.role == "admin") {
                        let result = await User.findByIdAndUpdate({
                            status: req.params.id
                        }, {
                            status: '0'
                        });
                        res.status(200).send({
                            user: result,
                            message: "The user has been deactivated"
                        });
                    } else {
                        res.status(200).send({
                            message: "Permission denied"
                        });
                    }

                } else {
                    res.status(404).send({
                        message: "User has not been found"
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
//logout user
exports.logout = [

]