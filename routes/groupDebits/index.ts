import Router from '../../core/router';
import reviewDebitRequests from './createDebitReview';

const router = Router.getOrCreateRouter('Group Debit Approval');

reviewDebitRequests(router);

export default router;