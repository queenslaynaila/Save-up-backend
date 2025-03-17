import Router from '../../router';
import reviewDebitRequests from './approveDebitRequest';;

const router = Router.getRouterInstance('/debit-approvals', 'Debit Approvals');

reviewDebitRequests(router);

export default router;