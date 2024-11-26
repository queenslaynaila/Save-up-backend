import Router from '../../router';
import createNextOfKin from './createNextOfKin';
import getNextOfKin from './getNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';
import updateNextOfKin from './updateNextOfKin';

const router = Router.getRouterInstance('/next-of-kins', 'Next of Kins');

createNextOfKin(router);
getNextOfKin(router);
deleteNextOfKin(router);
updateNextOfKin(router);

export default router;