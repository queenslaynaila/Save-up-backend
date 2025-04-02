import Router from '../../router';
import getTransactions from './getTransactionsByEntity';
import createSaving from './createSaving';
import createTransfer from './createTransfer';
import createWithdrawal from './createWithdrawal';
import createDonation from './createDonation';

const router = Router.getRouterInstance('/', 'Transactions');

createSaving(router);    
createTransfer(router);   
createWithdrawal(router); 
createDonation(router);
getTransactions(router);

export default router;