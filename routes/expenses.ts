import express, { Request, Response } from 'express';
const router = express.Router();
import * as expenseController from '../controllers/expensesController';
import authenticateToken from '../middleware/auth';
router.post('/', (req: Request, res: Response) => {
  expenseController.createExpense(req, res);
});

router.get('/', (req: Request, res: Response) => {
  expenseController.getAllExpenses(req, res);
});

router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  expenseController.getExpenseById(req, res);
});

router.patch('/:id', authenticateToken, (req: Request, res: Response) => {
  expenseController.updateExpense(req, res);
});

router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  expenseController.deleteExpense(req, res);
});

router.get('/category/:category', authenticateToken, (req: Request, res: Response) => {
  expenseController.getExpenseByCategory(req, res);
});
router.get('/month/:month', authenticateToken, (req: Request, res: Response) => {
  expenseController.getExpensesByMonth(req, res);
});

export default router;
