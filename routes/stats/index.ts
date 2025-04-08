import Router from '../../router';
import getExpenseStats from './getExpenseStats'
import getDepositStats from "./getDepositStats";
import getWithdrawalStats from "./getWithdrawalStats";

const router = Router.getRouterInstance('/', 'Stats');

getDepositStats(router)
getWithdrawalStats(router)
getExpenseStats(router)

export default router;