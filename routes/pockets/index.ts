import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import updatePocket from './updatePocket';
import fetchPocketBalances from './getTotalTransactions';

const router = Router.getRouterInstance('/pockets', 'Pockets');

createPocket(router);
deletePocket(router);
getPocketByCriteria(router);
updatePocket(router);
fetchPocketBalances(router);

export default router;