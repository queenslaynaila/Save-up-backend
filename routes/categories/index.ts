import getAllCategories from './getAllCategories';
import createCategory from './createCategory';
import Router from '../../router';

const router = Router.getRouterInstance('/categories', 'Categories');

createCategory(router);
getAllCategories(router);

export default router;