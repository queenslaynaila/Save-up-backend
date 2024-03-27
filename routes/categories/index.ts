import  { FastifyInstance } from 'fastify';
import createCategory from './createCategory';
import deleteCategories from './deleteCategory';
import updateCategory from './updateCategory';
import getCategoriesByConditons from './getCategoriesByConditons';

export default (fastify: FastifyInstance) => {

  createCategory(fastify);
  deleteCategories(fastify);
  updateCategory(fastify);
  getCategoriesByConditons(fastify);

};
