import { Router } from 'express';
import createUser from './createUser';
import login from './login';
import updateUserPhoneNo from './getUserByCriteria';
import getUserByCriteria from './getUserByCriteria';
import logout from './logout';

export default (baseRouter: Router) => {
  const router = Router();

  createUser(router);
  login(router);
  getUserByCriteria(router);
  updateUserPhoneNo(router);
  logout(router);
  
  baseRouter.use('/users', router);
};

