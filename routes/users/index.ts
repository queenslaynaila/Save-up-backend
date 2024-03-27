import { FastifyInstance } from 'fastify';
import { UserRole } from '../../types/index';
import createUser from './createUser';
import getUsersByConditions from './getUsersByConditions';
import login from './login';
import signOut from './signOut';
import updateUser from './updateUser';
import updateUserPhoneNo from './updateUserPhoneNo';

export interface UserSchema {
  id:number;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export default (fastify: FastifyInstance) => {

  getUsersByConditions(fastify);
  createUser(fastify);
  updateUser(fastify);
  login(fastify);
  signOut(fastify);
  updateUserPhoneNo(fastify);

};
