const { body, check, validationResult } = require("express-validator");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");

//register user
exports.register = [
    body("name", "Name must not be empty.").isLength({ min: 5 }).trim(),
    body("password", "Password must not be empty.").isLength({ min: 6 }).trim().withMessage("Password must be at least 6 characters").trim(),
    check('confirmPassword').trim()
        .isLength({ min: 4, max: 16 })
        .withMessage('Password must be between 4 to 16 characters')
        .custom(async (confirmPassword, { req }) => {
            const password = req.body.password
            if (password !== confirmPassword) {
                throw new Error('Passwords must be same')
            }
        }),
    body("email", "Email must not be empty.").isEmail().trim().custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then(user => {
            if (user) {
                return Promise.reject("Email already exists.");
            }
        });
    }),
    body("username", "Username must not be empty.").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return User.findOne({ username: req.body.username }).then(user => {
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
                next(new httpError(422, { message: _errors }));
            }
            else {
                let hash = await passwordHash.hash(req.body.password);
                const user = new User(
                    {
                        name: req.body.firstName,
                        username: req.body.username,
                        email: req.body.email,
                        password: hash

                    }
                )
                const result = await user.save();
                res.status(200).send({ user: result });
            }
        }
        catch (error) {
            next(new httpError(500, { message: error.message }));
        }
    }];

//login
exports.login = [
    body("email", "Email is required.").isEmail().trim(),
    body("password", "Password is required.").isLength({ min: 6 }),
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let _errors = [];
                errors.array().forEach((element) => {
                    _errors.push(element.msg);
                });
                next(new httpError(422, { message: _errors }));
            }
            else {
                const foundUser = await User.findOne({ email: req.body.email })
                if (!foundUser) {
                    next(new httpError(404, 'User is not found in our system'));
                }
                //Compare password
                if (passwordHash.compare(foundUser.password)) {
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
                        res.status(200).send({ user: userData })
                    }
                    else {
                        next(new httpError(400, 'Your Account is not activated'));
                    }
                }


                res.status(200).send({ user: foundUser });
            }
        }
        catch (error) {
            next(new httpError(500, { message: error.message }));
        }
    }
];

//get all users,this is only for admin
exports.findall = async (req, res, next) => { };

//get single user,this is only for amdin
exports.find = async (req, res, next) => { };

//get single user,this is only for amdin
exports.update = async (req, res, next) => { };

//get single user,this is only for amdin
exports.changepassword = async (req, res, next) => { };

//Deactivate user
exports.deactivate = async (req, res, next) => { };
//activate user
exports.activate = async (req, res, next) => { };

