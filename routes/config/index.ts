import Router from '../../core/router';
import getConfigs from './getConfig';

const router = Router.getOrCreateRouter('Config');

getConfigs(router);

export default router;