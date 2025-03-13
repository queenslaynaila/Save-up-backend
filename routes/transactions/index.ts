import Router from '../../router';
import getTransactions from './getTransactions';
import createSaving from './createSaving';
import createTransfer from './createTransfer';
import createWithdrawal from './createWithdrawal';

const router = Router.getRouterInstance('/transactions', 'Transactions');

getTransactions(router);
createSaving(router);    
createTransfer(router);   
createWithdrawal(router);  

export default router;