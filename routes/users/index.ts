import { Router } from 'express';
import createUser from './createUser';
import getAllUsers from './getAllUsers';
import getUserById from './getUserById';
import login from './login';
import signOut from './signOut';
import updateUser from './updateUser';

export default (baseRouter: Router) => {
  const router = Router();

  createUser(router);
  getAllUsers(router);
  login(router);
  signOut(router);
  getUserById(router);
  updateUser(router);
 
  baseRouter.use('/users', router);
};
