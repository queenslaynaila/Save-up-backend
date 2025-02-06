import Router from '../../router';
import createWithdrawal from './createGroupWithdrawal';
import getGroupWithdrawals from './getWithdrawalRequest';

const router = Router.getRouterInstance('/group-withdrawals', 'Group Withdrawal Request');

createWithdrawal(router);
getGroupWithdrawals(router);

export default router;