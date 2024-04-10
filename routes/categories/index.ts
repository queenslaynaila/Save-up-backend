import express from 'express';
import createCategory from './createCategory';
import deleteCategories from './deleteCategory';
import updateCategory from './updateCategory';
import getAllCategories from './getAllCategories';

export default (baseRouter: express.Router) => {
  const router = express.Router();
  createCategory(router);
  deleteCategories(router);
  updateCategory(router);
  getAllCategories(router);

  baseRouter.use('/categories', router);
};
