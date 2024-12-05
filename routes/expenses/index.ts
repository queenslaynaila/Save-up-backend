import Router from '../../router';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesByCriteria from './getExpensesByCriteria';
import updateExpense from './updateExpense';
import getTotalUserExpenditure from './getTotalUserExpenditure';

const router = Router.getRouterInstance('/expenses', 'Expenses');
createExpense(router);
getExpensesByCriteria(router);
updateExpense(router);
deleteExpense(router);
getTotalUserExpenditure(router);

export default router;