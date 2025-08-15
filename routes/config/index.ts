import Router from '../../core/router';
import getConfigs from './getConfigs';

const router = Router.getOrCreateRouter('Config');

getConfigs(router);

export default router;