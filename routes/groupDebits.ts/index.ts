import Router from '../../router';
import createWithdrawal from './createGroupDebit';
import getGrpDebitRequests from './getGroupDebitRequests';
import reviewDebitRequests from './approveDebitRequest';

const router = Router.getRouterInstance('/debit-requests', 'Group Debit Requests');

createWithdrawal(router);
getGrpDebitRequests(router);
reviewDebitRequests(router);

export default router;