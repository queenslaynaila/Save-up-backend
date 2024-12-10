import Router from '../../router';
import updateUserAttributes from './updateAttributes';
import getUsersBySearchCriteria from './getUserByCriteria';
import getCommonGroups from './getCommonGroups';

const router = Router.getRouterInstance('/users', 'Users');

getUsersBySearchCriteria(router);
updateUserAttributes(router);
getCommonGroups(router);

export default router;