import Router from '../../router';
import createRatification from './createRatification';

const router = Router.getInstance('/ratifications', 'Ratifications');

createRatification(router);

export default router;