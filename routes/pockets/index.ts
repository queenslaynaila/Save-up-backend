import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import updatePocket from './updatePocket';
import getTransactionsForPocket from './getTransactionsForPocket';
import getBalanceForPocket from './getBalanceForPocket';

const router = Router.getRouterInstance('/pockets', 'Pockets');

createPocket(router);
deletePocket(router);
getPocketByCriteria(router);
getTransactionsForPocket(router);
updatePocket(router);
getBalanceForPocket(router);

export default router;