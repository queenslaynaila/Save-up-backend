import Router from '../../router';
import getTransactions from './getTransactionsByEntity';
import createSaving from './createSaving';
import createTransfer from './createTransfer';
import createWithdrawal from './createWithdrawal';

const router = Router.getRouterInstance('/', 'Transactions');

createSaving(router);    
createTransfer(router);   
createWithdrawal(router);  
getTransactions(router);

export default router;