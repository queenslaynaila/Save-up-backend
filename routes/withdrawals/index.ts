import createWithdrawal from './createWithdrawal';
import Router from '../../router';

const router = Router.getRouterInstance('/withdrawals', 'Withdrawal');

createWithdrawal(router);

export default router;