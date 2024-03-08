import { Router } from 'express';
import { UserRole } from '../../types/index';
import createUser from './createUser';
import getUsersByConditions from './getUsersByConditions';
import login from './login';
import signOut from './signOut';
import updateUser from './updateUser';
import updateUserPhoneNo from './updateUserPhoneNo';

export interface UserSchema {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}
export default (baseRouter: Router) => {
  const router = Router();

  getUsersByConditions(router);
  createUser(router);
  updateUser(router);
  login(router);
  signOut(router);
  updateUser(router);
  updateUserPhoneNo(router);
  
  baseRouter.use('/users', router);
};
