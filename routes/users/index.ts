import { Router } from 'express';
import createUser from './createUser';
import login from './login';
import getUserByCriteria from './getUserByCriteria';
import updateUserAttributes from './updateId';
import updateUserRole from './updateUserRole';
import logout from './logout';
import test from './test';

export default (baseRouter: Router) => {
  const router = Router();

  createUser(router);
  test(router);
  login(router);
  getUserByCriteria(router);
  updateUserRole(router);
  updateUserAttributes(router);
  logout(router);

  baseRouter.use('/users', router);
};