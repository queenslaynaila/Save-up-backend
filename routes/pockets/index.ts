import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import updatePocket from './updatePocket';
import fetchPocketBalances from './getTotalTransactions';
import getTotalSavings from './getTotalSavings';

const router = Router.getRouterInstance('/pockets', 'Pockets');

createPocket(router);
deletePocket(router);
getPocketByCriteria(router);
updatePocket(router);
fetchPocketBalances(router);
getTotalSavings(router);

export default router;