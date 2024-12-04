import Router from '../../router';
import ComputeTransactionTotals from './getTotalTransactions';
import getTransactions from './getTransactions';

const router = Router.getRouterInstance('/transactions', 'Transactions');

ComputeTransactionTotals(router);
getTransactions(router);

export default router;