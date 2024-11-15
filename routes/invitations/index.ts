import Router from '../../router';
import sendInvite from './sendInvite';
import getInvites from './getInvites';
import updateInvites from './updateInvites';

const router = Router.getInstance('/invitations', 'Invitations');

sendInvite(router);
getInvites(router);
updateInvites(router);

export default router;