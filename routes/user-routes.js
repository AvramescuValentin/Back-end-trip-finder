const express = require("express");
const {check} = require('express-validator');

const userControllers = require('../controllers/user-controller');

const router = express.Router();

router.get('/user/search/:name', userControllers.getUser);

router.get('/user/:uid', userControllers.getUserById);

router.post('/signup',[
    check('firstName').notEmpty(),
    check('lastName').notEmpty(),
    check('username').notEmpty(),
    check('email').isEmail(),
    check('password').isLength({min: 6}),
    check('gender').notEmpty(),
    check('location').notEmpty(),
    check('dateOfBirth').notEmpty()
], userControllers.signup);

router.post('/login', userControllers.login);

module.exports = router;