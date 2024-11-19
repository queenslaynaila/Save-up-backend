import Router from '../../router';
import createNextOfKin from './createNextOfKin';
import getNextOfKin from './getNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';

const router = Router.getRouterInstance('/next-of-kin', 'Next of Kin');

createNextOfKin(router);
getNextOfKin(router);
deleteNextOfKin(router);

export default router;