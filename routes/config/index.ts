import Router from '../../core/router';
import createConfiguration from './createConfig';
import getConfiguration from './getConfigs';
import updateConfiguration from './updateConfig';

const router = Router.getOrCreateRouter('Config');

createConfiguration(router);
getConfiguration(router);
updateConfiguration(router);

export default router;