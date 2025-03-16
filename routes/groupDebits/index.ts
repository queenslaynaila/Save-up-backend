import Router from '../../router';
import createDebitRequest from './createGroupDebit';
import getGrpDebitRequests from './getGroupDebitRequests';
import reviewDebitRequests from './approveDebitRequest';

const router = Router.getRouterInstance('/debit-requests', 'Group Debits');

createDebitRequest(router);
getGrpDebitRequests(router);
reviewDebitRequests(router);

export default router;