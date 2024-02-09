const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');


router.get('/', (req, res) => {
    usersController.getAllUsers(req, res);
});


router.get('/:id', (req, res) => {
    usersController.getUserById(req, res);
});

router.patch('/:id', (req, res) => {
    usersController.updateUser(req, res);
});

router.delete('/:id', (req, res) => {
    usersController.deleteUser(req, res);
});

router.post('/', (req, res) => {
    usersController.createUser(req, res);
});


router.post('/signin', (req, res) => {
    usersController.login(req, res);
});
router.post('/signout', (req, res) => {
    usersController.signout(req, res);
});

module.exports = router;
