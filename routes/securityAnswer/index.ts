import { Router } from 'express';
import createSecurityAnswer from './createSecurityAnswer';
import deleteSecurityAnswer from './deleteSecurityAnswer';

export default (baseRouter: Router) => {
  const router = Router();
  createSecurityAnswer(router);
  deleteSecurityAnswer(router);
  baseRouter.use('/security-answers', router);
};
