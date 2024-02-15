import express, { Request, Response } from 'express';
const router = express.Router();
import * as expenseController from '../controllers/expensesController';
import authenticateToken from '../middleware/auth';
router.post('/all', (req: Request, res: Response) => {
  expenseController.createExpense(req, res);
});
router.get('/', async (req: Request, res: Response) => {
  expenseController.getExpenses(req, res);
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

export default router;
