import Router from '../../router';
import getFinancialStats from './getFinancialStats';

const router = Router.getInstance('/stats', 'Stats');

getFinancialStats(router);

export default router;