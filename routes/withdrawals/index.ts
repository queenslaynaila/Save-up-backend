import createWithdrawal from './createWithdrawal';
import Router from '../../router';

const router = Router.getInstance('/withdrawals', 'Withdrawal');

createWithdrawal(router);

export default router;