import Router from '../../new/router';
import createNextOfKin from './createNextOfKin';
import getNextOfKin from './getNextOfKin';
import deleteNextOfKin from './deleteNextOfKin';
import updateNextOfKin from './updateNextOfKin';

const router = Router.createResourceRouter('Next of Kins');

createNextOfKin(router);
getNextOfKin(router);
updateNextOfKin(router);
deleteNextOfKin(router);

export default router;