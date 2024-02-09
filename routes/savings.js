const express = require('express');
const router = express.Router();
const savingsController = require('../controllers/savingsController');

// Create a new saving
router.post('/', (req, res) => {
    savingsController.createSaving(req, res);
});

// Get all savings
router.get('/', (req, res) => {
    savingsController.getAllSavings(req, res);
});

// Get a single saving by ID
router.get('/:id', (req, res) => {
    savingsController.getSavingById(req, res);
});

// Update a saving by ID
router.patch('/:id', (req, res) => {
    savingsController.updateSaving(req, res);
});

// Delete a saving by ID
router.delete('/:id', (req, res) => {
    savingsController.deleteSaving(req, res);
});

module.exports = router;
