import { Router } from 'express';
import postElections from './post_elections';

export default (baseRouter: Router) => {
  const router = Router();

  postElections(router);
  
  baseRouter.use('/elections', router)
};
