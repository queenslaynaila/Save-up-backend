import Router from '../../router';
import approveLoan from './createApproval';
import getUnapprovedLoans from './getUnnaprovedLoans';
import computeApprovals from './computeApprovals';

const router = Router.getInstance('/approved-loans', 'Approved Loans');

approveLoan(router);
getUnapprovedLoans(router);
computeApprovals(router);

export default router;