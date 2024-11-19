import Router from '../../router';
import createExternalSaving from './createExSaving';

const router = Router.getRouterInstance('/externalSaving', 'External Saving');

createExternalSaving(router);

export default router;