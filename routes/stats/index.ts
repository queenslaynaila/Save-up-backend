import Router from '../../router';
import getExpenseStats from './getExpenseStats'
import getDepositStats from "./getDepositStats";
import getWithdrawalStats from "./getWithdrawalStats";
import getRegistrationStats from "./getRegistrationStats";

const router = Router.getRouterInstance('/', 'Stats');

getDepositStats(router)
getWithdrawalStats(router)
getExpenseStats(router)
getRegistrationStats(router)

export default router;