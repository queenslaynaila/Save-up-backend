import Router from '../../router';
import createPocket from './createPocket';
import deletePocket from './deletePocket';
import getPocketByCriteria from './getPocketByCriteria';
import updatePocket from './updatePocket';

const router = Router.getRouterInstance('/pockets', 'Pockets');

createPocket(router);
deletePocket(router);
getPocketByCriteria(router);
updatePocket(router);

export default router;