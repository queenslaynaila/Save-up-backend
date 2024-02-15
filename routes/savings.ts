import express, { Request, Response } from 'express';
import * as savingsController from '../controllers/savingsController';
import authenticateToken from '../middleware/auth';
const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  savingsController.createSaving(req, res);
});

router.get('/all', (req: Request, res: Response) => {
  savingsController.getAllSavings(req, res);
});

router.patch('/:id', authenticateToken, (req: Request, res: Response) => {
  savingsController.updateSaving(req, res);
});

router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  savingsController.deleteSaving(req, res);
});

router.get('/', async (req: Request, res: Response) => {
  savingsController.getSavings(req, res);
});

export default router;
