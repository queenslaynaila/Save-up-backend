import getTotalUserExpenditure from './getTotalUserExpenditure';
import getTopExpenseCategories from './getTopExpenseCategories';
import Router from '../../router';

const router = Router.getRouterInstance('/cumulatives', 'Cumulatives');

getTotalUserExpenditure(router);
getTopExpenseCategories(router);

export default router;