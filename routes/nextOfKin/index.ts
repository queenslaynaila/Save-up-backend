import Router from '../../core/router';
import createNextOfKin from './createNextOfKin';
import getNextOfKin from './getNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';
import updateNextOfKin from './updateNextOfKin';

const router = Router.getOrCreateRouter('Next of Kins', true);

createNextOfKin(router);
getNextOfKin(router);
updateNextOfKin(router);
deleteNextOfKin(router);

export default router;