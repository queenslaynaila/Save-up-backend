import Router from '../../router';
import getFinancialStats from './getFinancialStats';

const router = Router.getRouterInstance('/stats', 'Stats');

getFinancialStats(router);

export default router;