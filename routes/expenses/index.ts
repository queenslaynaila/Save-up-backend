import Router from '../../router';
import createExpense from './createExpense';
import deleteExpense from './deleteExpense';
import getExpensesById from './getExpenseById';
import getExpensesByCriteria from './getExpensesByCriteria';
import updateExpense from './updateExpense';
import getTotalUserExpenditure from './getTotalUserExpenditure';

const router = Router.getRouterInstance('/expenses', 'Expenses');
getExpensesByCriteria(router);
getTotalUserExpenditure(router);
createExpense(router);
deleteExpense(router);
getExpensesById(router);
updateExpense(router);

export default router;