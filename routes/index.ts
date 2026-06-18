import { Router } from '../Router';
import users from './users';
import nextOfKin from './nextOfKin';
import elections from './elections';

export default (baseRouter: Router) => {
  users(baseRouter);
  nextOfKin(baseRouter);
  elections(baseRouter);
};
