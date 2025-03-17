import Router from '../../router';
import createWithdrawalRequest from './createWithdrawalRequests';
import getGrpDebitRequests from './getWithdrawalRequests';

const router = Router.getRouterInstance('/group-withdrawals', 'Group Withdrawal Request');

createWithdrawalRequest(router);
getGrpDebitRequests(router);

export default router;