import Router from '../../router';
import createSaving from './createSaving';
import createTransfer from './createTransfer';
import createWithdrawal from './createWithdrawal';
import getTransactions from './getTransactions';

const router = Router.getRouterInstance('/transactions', 'Transactions');

createSaving(router);
createTransfer(router);
createWithdrawal(router);
getTransactions(router);

export default router;