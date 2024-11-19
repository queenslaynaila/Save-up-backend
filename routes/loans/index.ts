import Router from '../../router';
import createLoanRequest from './createLoanRequest';
import getLoans from './getReviewedLoans';

const router = Router.getRouterInstance('/loans', 'Loans');
createLoanRequest(router);
getLoans(router);

export default router;