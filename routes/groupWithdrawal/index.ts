import Router from '../../router';
import createWithdrawal from './createGroupWithdrawal';

const router = Router.getRouterInstance('/group-withdrawals', 'Group Withdrawals');

createWithdrawal(router);

export default router;