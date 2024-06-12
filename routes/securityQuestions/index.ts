import { Router } from 'express';
import getAllSecurityQuestions from './getAllSecurityQuestions';
import getUsersQuestions from './getUsersQuestions';

export default (baseRouter: Router) => {
  const router = Router();

  getAllSecurityQuestions(router);
  getUsersQuestions(router);
  
  baseRouter.use('/security-questions', router)
};
