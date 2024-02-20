import { Router } from 'express';
import createUser from './createUser';
import getAllUsers from './getAllUsers';
import login from './login';
import signOut from './signOut';
import updateUser from './updateUser';

export default (baseRouter: Router) => {
  const router = Router();
  router.use(createUser);
  router.use(getAllUsers);
  router.use(login);
  router.use(signOut);
  router.use(updateUser);
  baseRouter.use('/users', router);
};
