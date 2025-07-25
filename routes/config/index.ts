import Router from '../../router';
import getConfig from './getConfig';

const router = Router.getRouterInstance('/config', 'Configurations');

getConfig(router);

export default router;