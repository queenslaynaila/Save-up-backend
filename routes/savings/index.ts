import getAvailableSavings from './availableSavings';
import Router from '../../router';

const router = Router.getRouterInstance('/savings', 'Savings');

getAvailableSavings(router);

export default router;