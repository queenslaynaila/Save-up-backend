import getAllCategories from './getAllCategories';
import Router from '../../router';

const router = Router.getInstance('/categories', 'Categories');

getAllCategories(router);

export default router;