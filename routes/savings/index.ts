import createSaving from './createSaving';
import totalSavings from './totalSavings';
import getAvailableSavings from './availableSavings';
import Router from '../../router';

const router = Router.getRouterInstance('/savings', 'Savings');

createSaving(router);
totalSavings(router);
getAvailableSavings(router);

export default router;