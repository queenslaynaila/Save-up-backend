import Router from '../../router';
import requestLoan from './createLoanRequest';
import getLoanRequests from './getLoanRequests';

const router = Router.getRouterInstance('/loans', 'Loans');

requestLoan(router);
getLoanRequests(router);

export default router;