import Router from '../../new/router';
import reviewDebitRequests from './createDebitReview';

const router = Router.createResourceRouter('Group Debit Approval');

reviewDebitRequests(router);

export default router;