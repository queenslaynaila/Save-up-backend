import getAllCategories from './getAllCategories';
import createCategory from './createCategory';
import Router from '../../core/router';

const router = Router.createResourceRouter('Categories');

createCategory(router);
getAllCategories(router);

export default router;