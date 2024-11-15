import createTransfer from './createTransfer';
import Router from '../../router';

const router = Router.getInstance('/transfers', 'Transfers');

createTransfer(router);

export default router;