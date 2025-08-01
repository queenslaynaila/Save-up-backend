import Router from '../../new/router';
import createWithdrawalRequest from './createWithdrawalRequests';
import getGrpDebitRequests from './getWithdrawalRequests';

const router = Router.createResourceRouter('Group Withdrawal Requests');

createWithdrawalRequest(router);
getGrpDebitRequests(router);

export default router;