import Router from '../../core/router';
import getTransactions from './getTransactionsByEntity';
import createSaving from './createSaving';
import createTransfer from './createTransfer';
import createWithdrawal from './createWithdrawal';
import createDonation from './createDonation';
import tr from 'zod/v4/locales/tr.cjs';

const router = Router.createResourceRouter('Transactions', true);

createSaving(router);
createTransfer(router);
createWithdrawal(router);
createDonation(router);
getTransactions(router);

export default router;