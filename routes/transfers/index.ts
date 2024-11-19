import createTransfer from './createTransfer';
import Router from '../../router';

const router = Router.getRouterInstance('/transfers', 'Transfers');

createTransfer(router);

export default router;