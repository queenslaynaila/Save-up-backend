import express, { Request, Response } from 'express';
import * as savingsController from '../controllers/savingsController';
const router = express.Router();


router.post('/', (req:Request, res:Response) => {
    savingsController.createSaving(req, res);
});

router.get('/', (req:Request, res:Response) => {
    savingsController.getAllSavings(req, res);
});

router.get('/:id', (req:Request, res:Response) => {
    savingsController.getSavingById(req, res);
});

router.patch('/:id', (req:Request, res:Response) => {
    savingsController.updateSaving(req, res);
});

router.delete('/:id', (req:Request, res:Response) => {
    savingsController.deleteSaving(req, res);
});

router.get('/category/:category', (req:Request, res:Response) => {
    savingsController.getSavingsByCategory(req, res);
});

router.get('/status/:status', (req:Request, res:Response) => {
    savingsController.getSavingsByStatus(req, res);
});

router.get('/priority/:priority', (req:Request, res:Response) => {
    savingsController.getSavingsByPriority(req, res);
});

router.get('/user/:id', (req:Request, res:Response) => {
    savingsController.getUserSavings(req, res);
});

export default router;
