import express, { Request, Response,NextFunction } from 'express';
import * as savingsController from '../controllers/savingsController';
import authenticateToken from '../middleware/auth';
const router = express.Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.createSaving(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.getAllSavings(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.updateSaving(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.deleteSaving(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.getSavings(req, res);
  } catch (error) {
    next(error);
  }
});


export default router;
