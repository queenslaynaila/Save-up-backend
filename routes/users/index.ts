import { Router } from 'express';
import login from './login';
import signOut from './signOut';
import updateUserPhoneNo from './updateUserPhoneNo';


export default (baseRouter: Router) => {
  const router = Router();

  login(router);
  signOut(router);
  updateUserPhoneNo(router);

  baseRouter.use('/users', router);
};
