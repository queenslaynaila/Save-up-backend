import createSaving from './createSaving';
import getSavingsByCriteria from './getSavingsByCriteria';
import totalSavings from './totalSavings';
import getAvailableSavings from './availableSavings';
import Router from '../../router';

const router = Router.getRouterInstance('/savings', 'Savings');

createSaving(router);
getSavingsByCriteria(router);
totalSavings(router);
getAvailableSavings(router);

export default router;