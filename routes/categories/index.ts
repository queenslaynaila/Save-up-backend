import express from 'express';
import createCategory from './createCategory';
import deleteCategories from './deleteCategory';
import getAllCategories from './getAllCategories';
import updateCategory from './updateCategory';
import getCategoriesByUserId from './getCategoriesByUserId';
export default (baseRouter: express.Router) => {
  const router = express.Router();
  createCategory(router);
  getAllCategories(router);
  deleteCategories(router);
  updateCategory(router);
  getCategoriesByUserId(router);

  baseRouter.use('/categories', router);
};
