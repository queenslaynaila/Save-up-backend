import Router from '../../router';
import createGroupDeposit from './createGroupDeposit';

const router = Router.getInstance('/group-deposits', 'Group Deposits');

createGroupDeposit(router);

export default router;