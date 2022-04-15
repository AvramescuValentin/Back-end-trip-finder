const express = require("express");
const { check } = require('express-validator');
const { append } = require("express/lib/response");

const userControllers = require('../controllers/user-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();
router.post('/signup', [
    check('firstName').notEmpty(),
    check('lastName').notEmpty(),
    check('username').notEmpty(),
    check('email').isEmail(),
    check('password').isLength({ min: 6 }),
    check('gender').notEmpty(),
    check('location').notEmpty(),
    check('dateOfBirth').notEmpty()
], userControllers.signup);

router.post('/login', userControllers.login);

append.use(checkAuth);
router.get('/user/search/:name', userControllers.getUser);

router.get('/user/:uid', userControllers.getUserById);


module.exports = router;