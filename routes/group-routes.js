const express = require("express");
const { check } = require('express-validator');

const groupControllers = require('../controllers/group-controller');
const postControllers = require('./../controllers/post-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/newsFeed', groupControllers.getGroupNewsFeed)

router.get('/:pid', groupControllers.getGroupById);

router.get('/user/:uid', groupControllers.getGroupsByUserId);

router.get('/post/:groupId', postControllers.getPosts)


router.post('/', [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('location').notEmpty(),
    check('isPrivate').notEmpty(),
    check('startDate').notEmpty(),
    check('endDate').notEmpty(),

], groupControllers.createGroup);

router.post('/post/:groupId', postControllers.addPost)

router.post('/join/:groupId', groupControllers.applyForGroup);

router.post('/leave/:groupId', groupControllers.leaveGroup);

router.patch('/:groupId', groupControllers.updateGroup);

router.delete('/:groupId', groupControllers.deleteGroup);

module.exports = router;
