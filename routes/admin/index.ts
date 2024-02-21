import { Router } from 'express';
import createAdmin from './createAdmin';

export default (baseRouter: Router) => {
  const router = Router(); 
   createAdmin(router);
 
  baseRouter.use('/admin', router);
};
