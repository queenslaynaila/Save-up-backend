import Router from '../../router';
import createSaving from './depositTransactions';
import createTransfer from './transfer';
import createWithdrawal from './withdrawal';
import getTransactions from './getTransactions';

const router = Router.getRouterInstance('/transactions', 'Transactions');

createSaving(router);
createTransfer(router);
createWithdrawal(router);
getTransactions(router);

export default router;