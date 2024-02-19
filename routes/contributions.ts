import express, { Request, Response,NextFunction } from 'express';
import * as contributionsController from '../controllers/contributionsController';
import authenticateToken from '../middleware/auth';
const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.getAllContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.getContributionsById(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.updateContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.deleteContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.createContributions(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/saving/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await contributionsController.getContributionsBySaving(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
