import Router from '../../router';
import getTransactions from './getTransactions';
import getTransactionDetails from './getTransactionById';

const router = Router.getInstance('/group-transactions', 'Group Transactions');

getTransactions(router);
getTransactionDetails(router);

export default router;