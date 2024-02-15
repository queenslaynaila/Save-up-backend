import express, { Request, Response } from 'express';
import * as resetPasswordController from '../controllers/resetPassword';
const router = express.Router();

router.post('/ini-password', (req: Request, res: Response) => {
  resetPasswordController.initiatePasswordReset(req, res);
});

 router.post('/reset-password', (req: Request, res: Response) => {
  resetPasswordController.resetPassword(req, res);
});
export default router;
