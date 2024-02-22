import { Router } from 'express';
import createSecurityAnswer from './createSecurityAnswer';
export default (baseRouter: Router) => {
  const router = Router();

 createSecurityAnswer(router);

  baseRouter.use('/security-answers', router);
};
