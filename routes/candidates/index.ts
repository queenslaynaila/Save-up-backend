import createCandidates from './createCandidates';
import getCandidates from './getCandidates';
import Router from '../../router';

const router = Router.getInstance('/candidates', 'Candidates');

createCandidates(router);
getCandidates(router);

export default router;