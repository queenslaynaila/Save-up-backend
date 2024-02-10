const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');


router.post('/', (req, res) => {
    savingsController.createSaving(req, res);
});

router.get('/', (req, res) => {
    savingsController.getAllSavings(req, res);
});

router.get('/:id', (req, res) => {
    savingsController.getSavingById(req, res);
});

router.patch('/:id', (req, res) => {
    savingsController.updateSaving(req, res);
});

router.delete('/:id', (req, res) => {
    savingsController.deleteSaving(req, res);
});

router.get('/category/:category', (req, res) => {
    savingsController.getSavingsByCategory(req, res);
});

router.get('/status/:status', (req, res) => {
    savingsController.getSavingsByStatus(req, res);
});

router.get('/priority/:priority', (req, res) => {
    savingsController.getSavingsByPriority(req, res);
});


module.exports = router;
