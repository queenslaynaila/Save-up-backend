import createSaving from './createSaving';
import getAvailableSavings from './availableSavings';
import Router from '../../router';

const router = Router.getRouterInstance('/savings', 'Savings');

createSaving(router);
getAvailableSavings(router);

export default router;