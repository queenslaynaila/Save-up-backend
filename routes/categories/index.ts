import getAllCategories from './getAllCategories';
import Router from '../../router';

const router = Router.getRouterInstance('/categories', 'Categories');

getAllCategories(router);

export default router;