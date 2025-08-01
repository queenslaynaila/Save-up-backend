import Router from '../../new/router';
import getExpenseStats from './getExpenseStats';
import getDepositStats from './getDepositStats';
import getWithdrawalStats from './getWithdrawalStats';
import getUserActivityStats from './getUserActivityStats';

const router = Router.createResourceRouter('Stats');

getDepositStats(router);
getWithdrawalStats(router);
getExpenseStats(router);
getUserActivityStats(router);

export default router;