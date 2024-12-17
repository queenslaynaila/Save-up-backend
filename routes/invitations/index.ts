import Router from '../../router';
import createInvite from './createInvite';
import getInvites from './getInvites';
import updateInvites from './updateInvites';

const router = Router.getRouterInstance('/invitations', 'Invitations');

createInvite(router);
getInvites(router);
updateInvites(router);

export default router;