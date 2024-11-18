import Router from '../../router';
import createElections from './createElections';
import getElections from './getElections';

const router = Router.getInstance('/elections', 'Elections');

createElections(router);
getElections(router);

export default router;