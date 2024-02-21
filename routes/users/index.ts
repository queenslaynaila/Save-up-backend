import { Router } from 'express';
import createUser from './createUser';
import getAllUsers from './getAllUsers';
import getUserById from './getUserById';
import login from './login';
import signOut from './signOut';
import updateUser from './updateUser';
import updateUserPhoneNo from './updateUserPhoneNo';
export default (baseRouter: Router) => {
  const router = Router();

  createUser(router);
  getAllUsers(router);
  login(router);
  signOut(router);
  getUserById(router);
  updateUser(router);
  updateUserPhoneNo(router);

  baseRouter.use('/users', router);
};
