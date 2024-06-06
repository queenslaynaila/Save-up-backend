import express from 'express';
import proposeAdmin from './proposeAdmin';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  proposeAdmin(router);

  baseRouter.use('/nominations', router);
};

