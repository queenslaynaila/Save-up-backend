import Router from '../../core/router';
import getConfig from './getConfig';

const router = Router.createResourceRouter('Config');

getConfig(router);

export default router;