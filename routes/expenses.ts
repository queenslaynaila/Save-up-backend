import express, { Request, Response } from 'express';
const router = express.Router();
import * as expenseController from '../controllers/expensesController';

router.post('/', (req: Request, res: Response) => {
  expenseController.createExpense(req, res);
});

router.get('/', (req: Request, res: Response) => {
  expenseController.getAllExpenses(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
  expenseController.getExpenseById(req, res);
});

router.patch('/:id', (req: Request, res: Response) => {
  expenseController.updateExpense(req, res);
});

router.delete('/:id', (req: Request, res: Response) => {
  expenseController.deleteExpense(req, res);
});

router.get('/category/:category', (req: Request, res: Response) => {
  expenseController.getExpenseByCategory(req, res);
});
router.get('/month/:month', (req: Request, res: Response) => {
  expenseController.getExpensesByMonth(req, res);
});

export default router;
