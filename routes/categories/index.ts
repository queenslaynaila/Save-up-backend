import getAllCategories from './getAllCategories';
import Router from '../../new/router';

const router = Router.createResourceRouter('Categories');

getAllCategories(router);

export default router;