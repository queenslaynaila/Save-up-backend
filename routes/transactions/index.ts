import Router from '../../router';
import computeTransactionTotals from './getTotalTransactions';
import createSaving from './depositTransactions';
import createTransfer from './transfer';
import createWithdrawal from './withdrawal';
import getTransactions from './getTransactions';

const router = Router.getRouterInstance('/transactions', 'Transactions');

createSaving(router);
createTransfer(router);
createWithdrawal(router);
computeTransactionTotals(router);
getTransactions(router);

export default router;