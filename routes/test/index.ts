import Router from '../../router';
import getConfig from './getConfig';
import testRoute from './updateUser';

const router = Router.getRouterInstance('/users', 'Users');

getConfig(router);
testRoute(router);

export default router;