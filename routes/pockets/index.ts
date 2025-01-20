import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketsByUser from './getPocketByCriteria';
import updatePocket from './updatePocket';
import fetchPocketBalances from './getTotalTransactions';
import getTotalSavings from './getTotalSavings';

const router = Router.getRouterInstance('/pockets', 'Pockets');

createPocket(router);
deletePocket(router);
getPocketsByUser(router);
updatePocket(router);
fetchPocketBalances(router);
getTotalSavings(router);

export default router;