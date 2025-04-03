import Router from '../../router';
import createNextOfKin from './createNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';
import updateNextOfKin from './updateNextOfKin';

const router = Router.getRouterInstance('/next-of-kins', 'Next of Kins');

createNextOfKin(router);
updateNextOfKin(router);
deleteNextOfKin(router);

export default router;