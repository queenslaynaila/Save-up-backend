import express, {NextFunction, Request, Response} from "express";
import * as expenseController from "../controllers/expensesController";
import authMiddleware, {UserRole} from "../middleware/auth";

const router = express.Router();

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

router.get('/:id', authMiddleware({roles: [UserRole.ADMIN, UserRole.USER]}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.getExpenseById(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authMiddleware({roles: UserRole.ADMIN}), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.updateExpense(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseController.deleteExpense(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
