import Router from '../../core/router';
import createConfiguration from './createConfig';
import getConfiguration from './getConfigs';
import updateConfiguration from './updateConfig';
import deleteConfiguration from './deleteConfig';

const router = Router.getOrCreateRouter('Config');

createConfiguration(router);
getConfiguration(router);
updateConfiguration(router);
deleteConfiguration(router);

export default router;