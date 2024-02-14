import express, { Request, Response } from 'express';
import * as contributionsController from '../controllers/contributionsController';
import authenticateToken from '../middleware/auth';
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  contributionsController.getAllContributions(req, res);
});

router.get('/:id',authenticateToken, (req: Request, res: Response) => {
  contributionsController.getContributionsById(req, res);
});

router.patch('/:id',authenticateToken, (req: Request, res: Response) => {
  contributionsController.updateContributions(req, res);
});

router.delete('/:id', authenticateToken,(req: Request, res: Response) => {
  contributionsController.deleteContributions(req, res);
});

router.post('/', (req: Request, res: Response) => {
  contributionsController.createContributions(req, res);
});

router.get('/saving/:id',authenticateToken, (req: Request, res: Response) => {
  contributionsController.getContributionsBySaving(req, res);
});

export default router;
