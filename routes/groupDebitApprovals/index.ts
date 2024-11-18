import Router from '../../router';
import approveWithdrawal from './approveWithdrawal';

const router = Router.getInstance('/group-withdrawal-approvals', 'Group Withdrawal Approvals');

approveWithdrawal(router);

export default router;