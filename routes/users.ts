import express, { Request, Response,NextFunction} from 'express';
import * as usersController from '../controllers/usersController';
import authenticateToken from '../middleware/auth';
import 'express-async-errors';

const router = express.Router();

router.get('/',async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.getAllUsers(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',authenticateToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    await  usersController.getUserById(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authenticateToken,async (req: Request, res: Response, next: NextFunction) => {
  try {
    await  usersController.updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    await  usersController.deleteUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.createUser(req, res);
  } catch (error) {
    next(error); 
  }
});

router.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await usersController.login(req, res);
  } catch (error) {
    next(error); 
  }
});

router.post('/signout', authenticateToken,async (req: Request, res: Response, next: NextFunction) => {
  try {
    await  usersController.signout(req, res);
  } catch (error) {
    next(error);
  }
});


export default router;
