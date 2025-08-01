import getAllCategories from './getAllCategories';
import Router from '../../core/router';

const router = Router.createResourceRouter('Categories');

getAllCategories(router);

export default router;