import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import updatePocket from './updatePocket';
import getTransactionsForPocket from './getTransactionsForPocket';

const router = Router.getInstance('/pockets', 'Pockets');

createPocket(router);
deletePocket(router);
getPocketByCriteria(router);
getTransactionsForPocket(router);
updatePocket(router);

export default router;