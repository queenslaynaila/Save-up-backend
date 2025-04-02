import Router from '../../router';
import createWithdrawalRequest from './createWithdrawalRequests';
import getGrpDebitRequests from './getWithdrawalRequests';

const router = Router.getRouterInstance('/', 'Group Withdrawal Requests');

createWithdrawalRequest(router);
getGrpDebitRequests(router);

export default router;