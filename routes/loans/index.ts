import Router from '../../new/router';
import requestLoan from './createLoanRequest';
import addLoanGuarantors from './createLoanGuarantors';
import getGuarantorRequests from './getGuarantorRequests';
import approveGuarantorRequest from './approveGurantorRequest';
import getLoanRequests from './getLoanRequests';

const router = Router.createResourceRouter('Loans');

requestLoan(router);
addLoanGuarantors(router);
getGuarantorRequests(router);
approveGuarantorRequest(router);
getLoanRequests(router);

export default router;