import Router from '../../router';
import reviewDebitRequests from './createDebitReview';

const router = Router.getRouterInstance('/', 'Group Debit Approval');

reviewDebitRequests(router)

export default router;