import Router from '../../router';
import approveWithdrawal from './approveWithdrawal';

const router = Router.getRouterInstance('/group-withdrawal-approvals', 'Group Withdrawal Approvals');

approveWithdrawal(router);

export default router;