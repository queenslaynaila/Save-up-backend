import { Router } from 'express';
import getAllSecurityQuestions from './getAllSecurityQuestions';

export default (baseRouter: Router) => {
  const router = Router();

  getAllSecurityQuestions(router);
  
  baseRouter.use('/security-questions', router)
};
