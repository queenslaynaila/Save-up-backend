import Router from '../../core/router';
import getConfig from './getConfig';

const router = Router.getOrCreateRouter('Config');

getConfig(router);

export default router;