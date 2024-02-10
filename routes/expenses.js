const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expensesController');

router.post('/', (req, res) => {
    expenseController.createExpense(req, res);
});

router.get('/', (req, res) => {
    expenseController.getAllExpenses(req, res);
});

router.get('/:id', (req, res) => {
    expenseController.getExpenseById(req, res);
});

router.patch('/:id', (req, res) => {
    expenseController.updateExpense(req, res);
});

router.delete('/:id', (req, res) => {
    expenseController.deleteExpense(req, res);
});

router.get('/category/:category', (req, res) => {
    expenseController.getExpenseByCategory(req, res);
});

module.exports = router;
