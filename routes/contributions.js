const { Router} =  require('express');
const router = Router();
const contributionsController = require('../controllers/contributionsController');


router.get('/', (req, res) => {
    contributionsController.getAllContributions(req, res);
});


router.get('/:id', (req, res) => {
    contributionsController.getContributionsById(req, res);
});

router.patch('/:id', (req, res) => {
    contributionsController.updateContributions(req, res);
});

router.delete('/:id', (req, res) => {
    contributionsController.deleteContributions(req, res);
});

router.post('/', (req, res) => {
    contributionsController.createContributions(req,res)
});




module.exports = router;