import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import * as expenseController from '../controllers/expensesController';
import authenticateToken from '../middleware/auth';

router.post('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.createExpense(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.getExpenses(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.getAllExpenses(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.getExpenseById(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.updateExpense(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.deleteExpense(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
