import Router from '../../router';
import createLoanRequest from './createLoanRequest';
import getLoans from './getReviewedLoans';

const router = Router.getInstance('/loans', 'Loans');
createLoanRequest(router);
getLoans(router);

export default router;