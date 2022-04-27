const express = require("express");
const { check } = require('express-validator');

const groupControllers = require('../controllers/group-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/:pid', groupControllers.getGroupById);

router.get('/user/:uid', groupControllers.getGroupsByUserId);

router.post('/', [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('location').notEmpty()
], groupControllers.createGroup);

router.patch('/:pid', groupControllers.updateGroup);

router.delete('/:pid', groupControllers.deleteGroup);

module.exports = router;