const { body, validationResult } = require("express-validator");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const httpError = require("http-errors");


//register user
exports.register = async (req, res, next) => { };
//login
exports.login = async (req, res, next) => { };
//get all users,this is only for admin
exports.findall = async (req, res, next) => { };
//get single user,this is only for amdin
exports.find = async (req, res, next) => { };
//Deactivate user
exports.deactivate = async (req, res, next) => { };
//activate user
exports.activate = async (req, res, next) => { };

