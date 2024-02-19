import express, { Request, Response,NextFunction } from 'express';
import * as savingsController from '../controllers/savingsController';
import authMiddleware from '../middleware/auth';
const router = express.Router();

router.post('/',authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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

router.patch('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.updateSaving(req, res);
  } catch (error) {
    next(error);
  }
});
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.getSavingById(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.deleteSaving(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await savingsController.getSavings(req, res);
  } catch (error) {
    next(error);
  }
});


export default router;
