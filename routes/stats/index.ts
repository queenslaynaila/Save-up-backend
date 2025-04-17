import Router from '../../router';
import getExpenseStats from './getExpenseStats'
import getDepositStats from "./getDepositStats";
import getWithdrawalStats from "./getWithdrawalStats";
import getUserActivityStats from "./getUserActivityStats";

const router = Router.getRouterInstance('/', 'Stats');

getDepositStats(router)
getWithdrawalStats(router)
getExpenseStats(router)
getUserActivityStats(router)

export default router;