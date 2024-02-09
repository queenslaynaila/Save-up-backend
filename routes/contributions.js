const { Router} =  require('express');
const router = Router();
const contributionsController = require('../controllers/contributionsController');


router.get('/', (req, res) => {
    contributionsController.getAllContributions(req, res);
});


router.get('/:id', (req, res) => {
    contributionsController.getContributionById(req, res);
});

router.patch('/:id', (req, res) => {
    contributionsController.updateContribution(req, res);
});

router.delete('/:id', (req, res) => {
    contributionsController.deleteContribution(req, res);
});

router.post('/', (req, res) => {
    contributionsController.createContribution(req,res)
});




module.exports = router;