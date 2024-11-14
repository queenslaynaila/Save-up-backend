import { getAllCategories, createCategory } from './getAllCategories';
import Router from '../../router';

const router = new Router('/categories', 'Categories');

getAllCategories(router);
createCategory(router);

export default router;