import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketsByEntity from './getPocketsByEntity';
import updatePocket from './updatePocket';
import getBalanceForAnEntity from './getPocketBalance';

const router = Router.getRouterInstance('/', 'Pockets');

createPocket(router);
getPocketsByEntity(router);
updatePocket(router);
deletePocket(router);
getBalanceForAnEntity(router);

export default router;