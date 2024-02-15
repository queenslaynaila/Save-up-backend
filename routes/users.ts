import express, { Request, Response } from 'express';
import * as usersController from '../controllers/usersController';
import authenticateToken from '../middleware/auth';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  usersController.getAllUsers(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
  usersController.getUserById(req, res);
});

router.patch('/:id', authenticateToken, (req: Request, res: Response) => {
  usersController.updateUser(req, res);
});

router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  usersController.deleteUser(req, res);
});

router.post('/', (req: Request, res: Response) => {
  usersController.createUser(req, res);
});

router.post('/signin', (req: Request, res: Response) => {
  usersController.login(req, res);
});
router.post('/signout', authenticateToken, (req: Request, res: Response) => {
  usersController.signout(req, res);
});

export default router;
