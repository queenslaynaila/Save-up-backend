import express, { Request, Response } from 'express';
import * as usersController from '../controllers/usersController';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  usersController.getAllUsers(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
  usersController.getUserById(req, res);
});

router.patch('/:id', (req: Request, res: Response) => {
  usersController.updateUser(req, res);
});

router.delete('/:id', (req: Request, res: Response) => {
  usersController.deleteUser(req, res);
});

router.post('/', (req: Request, res: Response) => {
  usersController.createUser(req, res);
});

router.post('/signin', (req: Request, res: Response) => {
  usersController.login(req, res);
});
router.post('/signout', (req: Request, res: Response) => {
  usersController.signout(req, res);
});

export default router;
