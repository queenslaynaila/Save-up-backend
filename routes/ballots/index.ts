import Router from '../../router';
import createBallot from './createBallot';
import getBallots from './computeBallot';

const router = Router.getInstance('/ballots', 'Ballots');

createBallot(router);
getBallots(router);

export default router;