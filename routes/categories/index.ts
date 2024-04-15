import express from 'express';
import createCategory from './createCategory';
import deleteCategories from './deleteCategory';
import updateCategory from './updateCategory';
import getAllCategories from './getAllCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  
  createCategory(router);
  updateCategory(router);
  getAllCategories(router);
  deleteCategories(router);
  
  baseRouter.use('/categories', router);
};
