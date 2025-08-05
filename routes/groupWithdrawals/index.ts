import Router from '../../core/router';
import createWithdrawalRequest from './createWithdrawalRequests';
import getGrpDebitRequests from './getWithdrawalRequests';

const router = Router.getOrCreateRouter('Group Withdrawal Requests');

createWithdrawalRequest(router);
getGrpDebitRequests(router);

export default router;