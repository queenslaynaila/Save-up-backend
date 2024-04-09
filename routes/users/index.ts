import { Router } from 'express';
import createUser from './createUser';
import login from './login';
import signOut from './signOut';
import updateUserPhoneNo from './updateUserPhoneNo';
import getUsersByConditions from './getUsersByConditions';

export default (baseRouter: Router) => {
  const router = Router();

  createUser(router);
  login(router);
  getUsersByConditions(router);
  updateUserPhoneNo(router);
  signOut(router);

  baseRouter.use('/users', router);
};
