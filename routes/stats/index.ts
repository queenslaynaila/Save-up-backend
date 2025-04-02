import Router from '../../router';
import getTransactionStats from './getTransactionStats'

const router = Router.getRouterInstance('/', 'Stats');

getTransactionStats(router)

export default router;