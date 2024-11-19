import Router from '../../router';
import createRatification from './createRatification';
import computeRatification from './computeRatification';

const router = Router.getRouterInstance('/ratifications', 'Ratifications');

createRatification(router);
computeRatification(router);

export default router;