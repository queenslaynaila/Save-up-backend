import express from 'express';
import getAllCategories from './getAllCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();

  getAllCategories(router);
  
  baseRouter.use('/categories', router);
};
