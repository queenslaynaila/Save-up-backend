import { Router } from 'express';
import createSecurityAnswer from './createSecurityAnswer';
import updateSecurityAnswer from './updateAnswer';

export default (baseRouter: Router) => {
  const router = Router();

  createSecurityAnswer(router);
  updateSecurityAnswer(router);
  
  baseRouter.use('/security-answers', router);
};

