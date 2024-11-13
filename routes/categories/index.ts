import getAllCategories from './getAllCategories';
import Router from '../../router';

const router = new Router('/categories', 'Categories');

getAllCategories(router);

export default getAllCategories;